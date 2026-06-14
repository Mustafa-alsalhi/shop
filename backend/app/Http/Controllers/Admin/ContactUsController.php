<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactUs;
use App\Mail\ContactReplyMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class ContactUsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $contacts = ContactUs::orderBy('created_at', 'desc')->get();
        return response()->json($contacts);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return response()->json(['message' => 'Create form']);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $contact = ContactUs::create($request->all());

        return response()->json($contact, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        // Mark as read if not already read
        if (!$contact->read_at) {
            $contact->read_at = now();
            $contact->save();
        }

        return response()->json($contact);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }
        return response()->json($contact);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,read,replied,closed',
            'admin_reply' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['status', 'admin_reply']);

        // Auto-set timestamps based on status
        if ($request->status === 'read' && !$contact->read_at) {
            $data['read_at'] = now();
        }
        
        if ($request->status === 'replied' && !$contact->replied_at) {
            $data['replied_at'] = now();
            if (!$contact->read_at) {
                $data['read_at'] = now();
            }
        }

        $contact->update($data);

        // Send email to customer if reply is provided and status is replied
        if ($request->status === 'replied' && !empty($request->admin_reply)) {
            try {
                // Check mail configuration first
                $mailConfig = [
                    'driver' => config('mail.default'),
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'username' => config('mail.mailers.smtp.username'),
                    'from_address' => config('mail.from.address'),
                ];
                
                \Log::info('Mail configuration: ', $mailConfig);
                \Log::info('Attempting to send email to: ' . $contact->email);
                
                // Check if mail is properly configured
                if (empty($mailConfig['username']) || $mailConfig['username'] === 'null') {
                    throw new \Exception('Mail username not configured. Please check MAIL_USERNAME in .env file.');
                }
                
                Mail::to($contact->email)->send(new ContactReplyMail($contact, $request->admin_reply));
                
                \Log::info('Email sent successfully to: ' . $contact->email);
                
                return response()->json([
                    'contact' => $contact,
                    'message' => 'تم تحديث الرسالة وإرسال الرد للعميل عبر البريد الإلكتروني',
                    'email_sent' => true,
                    'mail_config' => $mailConfig
                ]);
            } catch (\Exception $e) {
                // Log detailed error
                \Log::error('Failed to send contact reply email: ' . $e->getMessage());
                \Log::error('Email details: To=' . $contact->email . ', Reply=' . $request->admin_reply);
                
                return response()->json([
                    'contact' => $contact,
                    'message' => 'تم تحديث الرسالة ولكن فشل إرسال البريد الإلكتروني',
                    'warning' => 'Email sending failed: ' . $e->getMessage(),
                    'email_sent' => false,
                    'troubleshooting' => [
                        'Check MAIL_USERNAME and MAIL_PASSWORD in .env file',
                        'Ensure SMTP credentials are correct',
                        'Verify firewall allows SMTP connections',
                        'Try using Gmail App Password instead of regular password'
                    ]
                ]);
            }
        }

        return response()->json($contact);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }

    /**
     * Get statistics
     *
     * @return \Illuminate\Http\Response
     */
    public function getStatistics()
    {
        $stats = [
            'total' => ContactUs::count(),
            'pending' => ContactUs::where('status', 'pending')->count(),
            'read' => ContactUs::where('status', 'read')->count(),
            'replied' => ContactUs::where('status', 'replied')->count(),
            'closed' => ContactUs::where('status', 'closed')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get contacts by status
     *
     * @param  string  $status
     * @return \Illuminate\Http\Response
     */
    public function getByStatus($status)
    {
        $validStatuses = ['pending', 'read', 'replied', 'closed'];
        
        if (!in_array($status, $validStatuses)) {
            return response()->json(['message' => 'Invalid status'], 400);
        }

        $contacts = ContactUs::where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($contacts);
    }

    /**
     * Mark as read
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function markAsRead($id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        if (!$contact->read_at) {
            $contact->read_at = now();
            $contact->status = 'read';
            $contact->save();
        }

        return response()->json($contact);
    }

    /**
     * Mark as replied
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function markAsReplied($id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        if (!$contact->replied_at) {
            $contact->replied_at = now();
            $contact->read_at = now();
            $contact->status = 'replied';
            $contact->save();
        }

        return response()->json($contact);
    }

    /**
     * Mark as closed
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function markAsClosed($id)
    {
        $contact = ContactUs::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact not found'], 404);
        }

        $contact->status = 'closed';
        $contact->save();

        return response()->json($contact);
    }
}
