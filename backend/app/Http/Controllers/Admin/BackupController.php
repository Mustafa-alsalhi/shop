<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use ZipArchive;

class BackupController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'admin']);
    }

    public function createBackup()
    {
        try {
            $backupName = 'backup_' . date('Y_m_d_His');
            $backupPath = storage_path('app/backups/' . $backupName);
            
            // Ensure backups directory exists
            $backupsDir = storage_path('app/backups');
            if (!File::exists($backupsDir)) {
                File::makeDirectory($backupsDir, 0755, true);
            }
            
            if (!File::exists($backupPath)) {
                File::makeDirectory($backupPath, 0755, true);
            }

            $this->backupDatabase($backupPath);
            $this->backupFiles($backupPath);

            $zipFileName = $backupName . '.zip';
            $zipFilePath = storage_path('app/backups/' . $zipFileName);
            
            $this->createZip($backupPath, $zipFilePath);

            File::deleteDirectory($backupPath);

            $fileSize = File::size($zipFilePath);
            $fileSizeMB = round($fileSize / 1048576, 2);

            return response()->json([
                'message' => 'تم إنشاء النسخة الاحتياطية بنجاح',
                'backup_file' => $zipFileName,
                'file_size' => $fileSizeMB . ' MB',
                'created_at' => date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'خطأ في إنشاء النسخة الاحتياطية: ' . $e->getMessage()
            ], 500);
        }
    }

    private function backupDatabase($backupPath)
    {
        try {
            $dbConfig = config('database.connections.mysql');
            
            $host = $dbConfig['host'];
            $username = $dbConfig['username'];
            $password = $dbConfig['password'];
            $database = $dbConfig['database'];
            
            $backupFile = $backupPath . '/database.sql';
            
            // Skip mysqldump on Railway (may not be available), use Laravel method directly
            $this->backupDatabaseUsingLaravel($backupPath);
        } catch (\Exception $e) {
            $this->backupDatabaseUsingLaravel($backupPath);
        }
    }

    private function backupDatabaseUsingLaravel($backupPath)
    {
        $backupFile = $backupPath . '/database.sql';
        
        $tables = DB::select('SHOW TABLES');
        
        $sql = "-- Database Backup - " . date('Y-m-d H:i:s') . "\n\n";
        
        foreach ($tables as $table) {
            $tableName = array_values((array)$table)[0];
            
            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sql .= $createTable[0]->{'Create Table'} . ";\n\n";
            
            $rows = DB::table($tableName)->get();
            
            if (count($rows) > 0) {
                $columns = array_keys((array)$rows[0]);
                $columnsStr = '`' . implode('`, `', $columns) . '`';
                
                $sql .= "INSERT INTO `{$tableName}` ({$columnsStr}) VALUES\n";
                
                $values = [];
                foreach ($rows as $row) {
                    $rowArray = (array)$row;
                    $rowValues = [];
                    foreach ($rowArray as $value) {
                        if ($value === null) {
                            $rowValues[] = 'NULL';
                        } elseif (is_numeric($value)) {
                            $rowValues[] = $value;
                        } else {
                            $rowValues[] = "'" . addslashes($value) . "'";
                        }
                    }
                    $values[] = '(' . implode(', ', $rowValues) . ')';
                }
                
                $sql .= implode(",\n", $values) . ";\n\n";
            }
        }
        
        File::put($backupFile, $sql);
    }

    private function backupFiles($backupPath)
    {
        $filesPath = $backupPath . '/files';
        
        if (!File::exists($filesPath)) {
            File::makeDirectory($filesPath, 0755, true);
        }

        if (File::exists(public_path('images'))) {
            File::copyDirectory(public_path('images'), $filesPath . '/images');
        }

        $storagePath = storage_path('app');
        if (File::exists($storagePath)) {
            $this->copyDirectoryExclude($storagePath, $filesPath . '/storage', ['backups']);
        }
    }

    private function copyDirectoryExclude($source, $destination, $exclude = [])
    {
        if (!File::exists($destination)) {
            File::makeDirectory($destination, 0755, true);
        }

        $items = File::directories($source);
        
        foreach ($items as $item) {
            $itemName = basename($item);
            
            if (!in_array($itemName, $exclude)) {
                File::copyDirectory($item, $destination . '/' . $itemName);
            }
        }

        $files = File::files($source);
        foreach ($files as $file) {
            File::copy($file, $destination . '/' . $file->getFilename());
        }
    }

    private function createZip($source, $destination)
    {
        $zip = new ZipArchive();
        
        if ($zip->open($destination, ZipArchive::CREATE) === true) {
            $this->addFolderToZip($source, $zip, '');
            $zip->close();
        }
    }

    private function addFolderToZip($folder, $zip, $parentFolder = '')
    {
        $files = scandir($folder);
        
        foreach ($files as $file) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            
            $filePath = $folder . '/' . $file;
            $zipPath = ($parentFolder ? $parentFolder . '/' : '') . $file;
            
            if (is_dir($filePath)) {
                $zip->addEmptyDir($zipPath);
                $this->addFolderToZip($filePath, $zip, $zipPath);
            } else {
                $zip->addFile($filePath, $zipPath);
            }
        }
    }

    public function listBackups()
    {
        try {
            $backupPath = storage_path('app/backups');
            
            if (!File::exists($backupPath)) {
                File::makeDirectory($backupPath, 0755, true);
            }

            $backups = [];
            $files = File::files($backupPath);
            
            foreach ($files as $file) {
                if ($file->getExtension() === 'zip') {
                    $backups[] = [
                        'name' => $file->getFilename(),
                        'size' => round($file->getSize() / 1048576, 2) . ' MB',
                        'created_at' => date('Y-m-d H:i:s', $file->getCTime()),
                        'path' => $file->getPathname()
                    ];
                }
            }

            usort($backups, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            return response()->json([
                'backups' => $backups,
                'total' => count($backups)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'خطأ في جلب النسخ الاحتياطية: ' . $e->getMessage()
            ], 500);
        }
    }

    public function downloadBackup($filename)
    {
        try {
            $backupPath = storage_path('app/backups/' . $filename);
            
            if (!File::exists($backupPath)) {
                return response()->json(['message' => 'النسخة الاحتياطية غير موجودة'], 404);
            }

            return response()->download($backupPath);
        } catch (\Exception $e) {
            return response()->json(['message' => 'خطأ في تحميل النسخة الاحتياطية: ' . $e->getMessage()], 500);
        }
    }

    public function deleteBackup($filename)
    {
        try {
            $backupPath = storage_path('app/backups/' . $filename);
            
            if (!File::exists($backupPath)) {
                return response()->json(['message' => 'النسخة الاحتياطية غير موجودة'], 404);
            }

            File::delete($backupPath);

            return response()->json(['message' => 'تم حذف النسخة الاحتياطية بنجاح']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'خطأ في حذف النسخة الاحتياطية: ' . $e->getMessage()], 500);
        }
    }
}
