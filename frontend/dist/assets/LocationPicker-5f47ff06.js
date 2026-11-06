import{r as n,a7 as M,j as e}from"./index-4647e45d.js";import{L,M as A,T as P,a as _,b as E,u as H}from"./leaflet-564dc183.js";const R=`
  .leaflet-container {
    z-index: 0 !important;
    font-family: inherit;
  }
  .leaflet-pane {
    z-index: 0 !important;
  }
  .leaflet-marker-pane {
    z-index: 1 !important;
  }
  .leaflet-popup-pane {
    z-index: 2 !important;
  }
  .custom-map-pin {
    animation: bounce 0.5s ease-out infinite alternate;
  }
  @keyframes bounce {
    0% { transform: translateY(0); }
    100% { transform: translateY(-5px); }
  }
  .loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(2px);
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #f59e0b; /* Amber */
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`,S=`
<svg width="46" height="46" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#E11D48" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="12" cy="9" r="3.5" fill="#FFFFFF"/>
</svg>
`,G=new L.divIcon({className:"bg-transparent border-0",html:`<div style="transform: translate(-50%, -100%); filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.15)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1)); cursor: grab;">${S}</div>`,iconSize:[0,0],iconAnchor:[0,0]}),T=({onLocationSelect:i,initialPosition:b=null})=>{const[s,u]=n.useState(b||[24.7136,46.6753]),[c,m]=n.useState(!1),[y,g]=n.useState(""),[x,h]=n.useState(""),[l,v]=n.useState(""),w=n.useRef(null),f=n.useRef(null);n.useEffect(()=>{const t=document.createElement("style");return t.textContent=R,document.head.appendChild(t),()=>{document.head.contains(t)&&document.head.removeChild(t)}},[]);const d=n.useCallback(async(t,a)=>{try{const o=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${t}&lon=${a}&accept-language=ar`)).json();if(o.display_name)return h(o.display_name),o.display_name}catch(r){console.error("Geocoding error:",r)}return""},[]),j=n.useCallback(()=>{if(m(!0),g("جاري الاتصال بالأقمار الصناعية (GPS)..."),!navigator.geolocation){m(!1),alert("متصفحك لا يدعم تحديد الموقع التلقائي. يرجى تحديد الموقع يدوياً على الخريطة.");return}const t=async r=>{const{latitude:o,longitude:p}=r.coords;u([o,p]),g("جاري تحديد اسم الشارع والعنوان...");const F=await d(o,p);i({latitude:o,longitude:p,formatted_address:F,building_details:l}),m(!1)},a=()=>{g("نجري محاولة أخيرة عبر شبكة الإنترنت المتاحة..."),navigator.geolocation.getCurrentPosition(t,r=>{m(!1),alert("تعذر تحديد موقعك بدقة. الرجاء تحديد موقعك يدوياً عبر سحب الدبوس على الخريطة لمكانك.")},{enableHighAccuracy:!1,timeout:1e4,maximumAge:1/0})};navigator.geolocation.getCurrentPosition(t,r=>{console.warn("High Accuracy GPS failed. Falling back to IP/Wifi based location...",r),a()},{enableHighAccuracy:!0,timeout:6e3,maximumAge:0})},[d,i,l]),k=()=>(E({click(t){const a=[t.latlng.lat,t.latlng.lng];u(a),d(a[0],a[1]).then(r=>{i({latitude:a[0],longitude:a[1],formatted_address:r,building_details:l})})}}),null),N=()=>{const t=H();return n.useEffect(()=>{s&&s.length===2&&!isNaN(s[0])&&!isNaN(s[1])&&t.flyTo(s,16,{animate:!0,duration:1.5})},[s,t]),null},z=M.useMemo(()=>({async dragend(){const t=f.current;if(t!=null){const a=t.getLatLng(),r=[a.lat,a.lng];u(r);const o=await d(a.lat,a.lng);i({latitude:a.lat,longitude:a.lng,formatted_address:o,building_details:l})}}}),[d,i,l]),C=t=>{const a=t.target.value;v(a),i({latitude:s[0],longitude:s[1],formatted_address:x,building_details:a})};return e.jsxs("div",{className:"space-y-4 relative",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:j,disabled:c,className:"flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium text-sm",children:[e.jsxs("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 11a3 3 0 11-6 0 3 3 0 016 0z"})]}),c?"جاري التحقق...":"تحديد موقعي التلقائي (GPS)"]}),e.jsx("span",{className:"text-xs text-gray-500",children:"(يمكنك سحب الدبوس للحصول على عنوان دقيق جداً)"})]}),e.jsxs("div",{className:"h-[420px] rounded-xl overflow-hidden border-2 border-gray-200 relative z-0 shadow-inner group",children:[c&&e.jsxs("div",{className:"loading-overlay",children:[e.jsx("div",{className:"spinner mb-4"}),e.jsx("p",{className:"text-sm font-semibold text-gray-800",children:y})]}),e.jsxs(A,{center:s,zoom:13,style:{height:"100%",width:"100%",zIndex:0},className:"z-0",ref:w,children:[e.jsx(P,{attribution:'© <a href="https://www.openstreetmap.org/copyright">OSM</a>',url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",className:"z-0"}),e.jsx(k,{}),e.jsx(N,{}),e.jsx(_,{position:s,draggable:!c,icon:G,ref:f,eventHandlers:z})]}),e.jsxs("div",{className:"absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 z-[9] pointer-events-none transition-opacity text-xs font-semibold text-gray-700 flex items-center gap-1.5 opacity-80 group-hover:opacity-100",children:[e.jsxs("svg",{className:"w-4 h-4 text-amber-500",fill:"currentColor",viewBox:"0 0 20 20",children:[e.jsx("path",{d:"M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"}),e.jsx("path",{fillRule:"evenodd",d:"M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z",clipRule:"evenodd"})]}),"يمكنك النقر على أي مساحة!"]})]}),e.jsxs("div",{className:"space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-semibold text-gray-700 mb-1.5",children:"العنوان المقروء من الخريطة"}),e.jsx("input",{type:"text",value:x,onChange:t=>h(t.target.value),className:"w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium text-gray-800",placeholder:"سيتم كتابة العنوان تلقائياً عند وضع الدبوس...",readOnly:!0})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-semibold text-gray-700 mb-1.5",children:"تفاصيل إضافية للوصول للمتجر (اختياري)"}),e.jsx("input",{type:"text",value:l,onChange:C,className:"w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white placeholder-gray-400 text-sm",placeholder:"مثال: بالقرب من مستشفى الثورة، خلف بقالة الحمد... إلخ"})]}),e.jsxs("div",{className:"text-xs text-gray-500 font-mono mt-2 bg-gray-100 px-3 py-2 rounded flex justify-between",children:[e.jsxs("p",{children:["Latitude: ",e.jsx("span",{className:"text-gray-800 font-bold",children:s[0].toFixed(6)})]}),e.jsxs("p",{children:["Longitude: ",e.jsx("span",{className:"text-gray-800 font-bold",children:s[1].toFixed(6)})]})]})]})]})};export{T as L};
