```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  svg {
    display: block;
    width: 100vw;
    height: 100vh;
    height: 100svh;
    overflow: visible;
  }
  .hair {
    transform-box: view-box;
    transform-origin: 166px 69px;
    animation: hair-drift 5s ease-in-out infinite alternate;
  }
  .tail {
    transform-box: view-box;
    transform-origin: 157px 239px;
    animation: tail-sway 3.8s ease-in-out infinite alternate;
  }
  .fin-tip {
    transform-box: view-box;
    transform-origin: 145px 307px;
    animation: fin-flick 2.6s ease-in-out infinite alternate;
  }
  .pearl {
    transform-box: view-box;
    transform-origin: 82px 105px;
    animation: pearl-glow 2.4s ease-in-out infinite;
  }
  .gills {
    animation: gill-glimmer 3s ease-in-out infinite alternate;
  }
  @keyframes hair-drift {
    from { transform: rotate(-2deg) translateY(0); }
    to   { transform: rotate(2deg) translateY(3px); }
  }
  @keyframes tail-sway {
    from { transform: rotate(-1.5deg); }
    to   { transform: rotate(2deg); }
  }
  @keyframes fin-flick {
    from { transform: rotate(-2deg); }
    to   { transform: rotate(3deg); }
  }
  @keyframes pearl-glow {
    0%, 100% { opacity: .78; transform: scale(.94); }
    50% { opacity: 1; transform: scale(1.08); }
  }
  @keyframes gill-glimmer {
    from { opacity: .48; }
    to   { opacity: 1; }
  }
</style>
</head>
<body>
<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d3f1df"/>
      <stop offset=".52" stop-color="#91d5c8"/>
      <stop offset="1" stop-color="#56aeb0"/>
    </linearGradient>
    <linearGradient id="tail" x1=".15" y1=".1" x2=".85" y2=".9">
      <stop offset="0" stop-color="#76d6c9"/>
      <stop offset=".48" stop-color="#258f9a"/>
      <stop offset="1" stop-color="#354f83"/>
    </linearGradient>
    <linearGradient id="fin" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#b6f0d5" stop-opacity=".9"/>
      <stop offset=".55" stop-color="#53b8b8" stop-opacity=".78"/>
      <stop offset="1" stop-color="#586da2" stop-opacity=".9"/>
    </linearGradient>
    <linearGradient id="hair-fill" x1=".1" y1=".1" x2=".9" y2=".8">
      <stop stop-color="#243d64"/>
      <stop offset=".5" stop-color="#355b78"/>
      <stop offset="1" stop-color="#4b8a8a"/>
    </linearGradient>
    <radialGradient id="pearl-fill">
      <stop stop-color="#fffde5"/>
      <stop offset=".45" stop-color="#e7f4d8"/>
      <stop offset="1" stop-color="#a5d6c9"/>
    </radialGradient>
    <pattern id="scales" width="12" height="10" patternUnits="userSpaceOnUse">
      <path d="M-3 5 Q3 -1 9 5 Q3 11 -3 5 M3 0 Q9 -6 15 0"
            fill="none" stroke="#d2f6d9" stroke-opacity=".3" stroke-width=".8"/>
    </pattern>
    <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>

  <!-- Flowing hair -->
  <g class="hair">
    <path d="M139 53
      C139 39 151 33 165 37
      C181 41 187 50 204 47
      C222 44 234 34 250 28
      C241 43 229 54 226 65
      C222 77 235 85 247 89
      C228 91 214 86 205 99
      C198 108 197 119 191 127
      C190 108 182 98 169 91
      C154 83 145 70 139 53Z"
      fill="url(#hair-fill)" stroke="#203958" stroke-width="1.5"/>
    <path d="M158 43 C176 53 182 68 197 73 C213 78 226 68 238 57"
      fill="none" stroke="#8ac9b6" stroke-opacity=".65" stroke-width="2"/>
    <path d="M150 51 C158 69 173 79 188 85 C204 91 215 87 230 83"
      fill="none" stroke="#a8dfc8" stroke-opacity=".48" stroke-width="1.5"/>
    <path d="M166 42 C166 58 179 68 192 72 C206 77 215 72 226 66"
      fill="none" stroke="#719db0" stroke-width="1.2"/>
    <path d="M179 48 C185 59 198 62 211 60 C222 58 232 51 241 43"
      fill="none" stroke="#719db0" stroke-width="1.2"/>
  </g>

  <!-- Tail and translucent fin -->
  <g class="tail">
    <path d="M134 177
      C151 185 166 199 172 218
      C180 242 176 256 158 276
      C147 288 134 294 130 306
      C115 297 108 287 111 276
      C115 261 133 248 139 230
      C145 211 137 194 124 185Z"
      fill="url(#tail)" stroke="#316d83" stroke-width="2"/>
    <path d="M134 185
      C151 197 163 212 166 229
      C170 248 157 263 141 278
      C130 288 123 296 121 301
      C111 291 113 282 120 272
      C133 254 145 239 145 222
      C145 207 137 194 129 188Z"
      fill="url(#scales)" opacity=".95"/>
    <path d="M144 194 C158 216 163 239 149 258"
      fill="none" stroke="#c5f1d9" stroke-opacity=".65" stroke-width="1.5"/>
    <path d="M170 242 C184 244 193 251 198 260
      C188 259 181 263 174 270 C184 270 190 276 193 283
      C178 280 169 282 158 291 C164 274 175 263 170 242Z"
      fill="url(#fin)" stroke="#6ab9b2" stroke-width="1.2"/>
    <path d="M174 250 Q184 256 194 260 M173 260 Q182 267 190 278"
      fill="none" stroke="#d3f4d9" stroke-opacity=".7" stroke-width="1"/>
    <g class="fin-tip">
      <path d="M129 296
        C116 300 99 298 82 289
        C88 306 84 319 70 333
        C95 332 114 324 132 310
        C144 322 160 334 185 340
        C176 323 177 308 188 294
        C166 299 148 300 129 296Z"
        fill="url(#fin)" stroke="#6ab9b2" stroke-width="1.5"/>
      <path d="M131 302 Q108 311 79 329
        M132 304 Q112 321 101 329
        M137 305 Q158 322 180 335
        M139 303 Q162 310 184 300"
        fill="none" stroke="#d7f5db" stroke-opacity=".72" stroke-width="1"/>
      <path d="M129 297 Q135 303 132 311"
        fill="none" stroke="#e4f7dc" stroke-width="2"/>
    </g>
  </g>

  <!-- Torso, arms, and face -->
  <g>
    <path d="M133 103
      C125 109 120 117 119 127
      C118 139 124 151 129 161
      L137 184
      C145 190 159 190 169 184
      C166 169 166 153 172 139
      C177 126 171 111 162 105Z"
      fill="url(#skin)" stroke="#4c9e9e" stroke-width="1.5"/>
    <path d="M127 118 C114 122 105 132 98 140
      C94 144 91 142 87 137 L81 129
      C77 126 73 130 77 135
      L85 147 C90 154 97 154 104 149
      L129 137Z"
      fill="url(#skin)" stroke="#4c9e9e" stroke-width="1.5"/>
    <path d="M164 119 C176 123 184 133 186 144
      C188 154 181 160 173 158
      L158 150"
      fill="none" stroke="#62b9ae" stroke-width="9" stroke-linecap="round"/>
    <path d="M164 119 C176 123 184 133 186 144
      C188 154 181 160 173 158 L158 150"
      fill="none" stroke="#c8ebd7" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/>

    <!-- Neck and profile -->
    <path d="M143 91 L143 108 C148 114 159 114 164 106 L158 88Z"
      fill="url(#skin)" stroke="#4c9e9e" stroke-width="1.2"/>
    <path d="M151 45
      C163 44 171 53 171 66
      C171 74 168 82 162 88
      C157 94 150 96 144 91
      C139 88 137 82 136 77
      C131 76 127 74 127 71
      C127 69 132 67 134 64
      C132 54 139 46 151 45Z"
      fill="url(#skin)" stroke="#4c9e9e" stroke-width="1.5"/>
    <path d="M133 69 Q129 71 135 73" fill="none" stroke="#4c9e9e" stroke-width="1"/>
    <path d="M139 63 Q142 60 146 62" fill="none" stroke="#355d72" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="142" cy="63" r="1.1" fill="#243d58"/>
    <path d="M137 79 Q142 82 147 80" fill="none" stroke="#5c9b96" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M159 69 Q165 73 159 78" fill="none" stroke="#4b9795" stroke-width="1.2"/>
    <g class="gills" fill="none" stroke="#e1f4d7" stroke-width="1.4" stroke-linecap="round">
      <path d="M163 78 Q169 82 164 87"/>
      <path d="M160 81 Q165 85 160 90"/>
      <path d="M156 83 Q160 87 156 91"/>
    </g>

    <!-- Pearl held lightly in the raised hand -->
    <g class="pearl">
      <circle cx="82" cy="105" r="11" fill="#e8f4ce" opacity=".24" filter="url(#soft-glow)"/>
      <circle cx="82" cy="105" r="5.2" fill="url(#pearl-fill)" stroke="#e6f4d6" stroke-width=".8"/>
      <circle cx="80.5" cy="103.2" r="1.2" fill="#fff"/>
    </g>
    <path d="M82 113 Q86 118 90 119" fill="none" stroke="#c6ead5" stroke-width="1.2" stroke-linecap="round"/>
  </g>
</svg>
</body>
</html>
```

```json
{
  "title": "The Pearl Listener",
  "statement": "A sailor swore she held a pearl to her ear, listening for the questions the sea had swallowed. When her tail turned, the answer shimmered once and was gone."
}
```