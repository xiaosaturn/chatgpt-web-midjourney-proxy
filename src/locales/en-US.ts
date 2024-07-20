export default {
  common: {
    add: 'Add',
    addSuccess: 'Add Success',
    edit: 'Edit',
    editSuccess: 'Edit Success',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    save: 'Save',
    saveSuccess: 'Save Success',
    reset: 'Reset',
    action: 'Action',
    export: 'Export',
    exportSuccess: 'Export Success',
    import: 'Import',
    importSuccess: 'Import Success',
    clear: 'Clear',
    clearSuccess: 'Clear Success',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    download: 'Download',
    noData: 'No Data',
    wrong: 'Something went wrong, please try again later.',
    success: 'Success',
    failed: 'Failed',
    verify: 'Verify',
    unauthorizedTips: 'Unauthorized, please verify first.',
    stopResponding: 'Stop Responding',
  },
  chat: {
    newChatButton: 'New Chat',
    //placeholder: 'Ask me anything...(Shift + Enter = line break, "/" to trigger prompts)',
    placeholder: 'Ask me anything, or paste screenshots or drag the file .(Shift + Enter = line break, "/" to trigger prompts)',
    placeholderMobile: 'Ask me anything...',
    copy: 'Copy',
    copied: 'Copied',
    copyCode: 'Copy Code',
    clearChat: 'Clear Chat',
    clearChatConfirm: 'Are you sure to clear this chat?',
    exportImage: 'Export Image',
    exportImageConfirm: 'Are you sure to export this chat to png?',
    exportSuccess: 'Export Success',
    exportFailed: 'Export Failed',
    usingContext: 'Context Mode',
    turnOnContext: 'In the current mode, sending messages will carry previous chat records.',
    turnOffContext: 'In the current mode, sending messages will not carry previous chat records.',
    deleteMessage: 'Delete Message',
    deleteMessageConfirm: 'Are you sure to delete this message?',
    deleteHistoryConfirm: 'Are you sure to clear this history?',
    clearHistoryConfirm: 'Are you sure to clear chat history?',
    preview: 'Preview',
    showRawText: 'Show as raw text',
  },
  setting: {
    setting: 'Setting',
    general: 'General',
    advanced: 'Advanced',
    config: 'Config',
    avatarLink: 'Avatar Link',
    name: 'Name',
    description: 'Description',
    role: 'Role',
    temperature: 'Temperature',
    top_p: 'Top_p',
    resetUserInfo: 'Reset UserInfo',
    chatHistory: 'ChatHistory',
    theme: 'Theme',
    language: 'Language',
    api: 'API',
    reverseProxy: 'Reverse Proxy',
    timeout: 'Timeout',
    socks: 'Socks',
    httpsProxy: 'HTTPS Proxy',
    balance: 'API Balance',
    monthlyUsage: 'Monthly Usage',
    email: 'Email',
    captcha: 'Captcha',
    getCaptcha: 'Get Captcha',
    password: 'Password',
    rePassword: 'Repeat Password',
    plzEmail: 'Please Input Email',
    plzPassword: 'Please Input Password',
    login: 'Login',
    register: 'Register',
    noAccount: 'No Account？GO 2 Register!',
    back: 'Back',
    expireTime: 'Expire Time',
    price: 'Price',
  },
  store: {
    siderButton: 'Prompt Store',
    local: 'Local',
    online: 'Online',
    title: 'Title',
    description: 'Description',
    clearStoreConfirm: 'Whether to clear the data?',
    importPlaceholder: 'Please paste the JSON data here',
    addRepeatTitleTips: 'Title duplicate, please re-enter',
    addRepeatContentTips: 'Content duplicate: {msg}, please re-enter',
    editRepeatTitleTips: 'Title conflict, please revise',
    editRepeatContentTips: 'Content conflict {msg} , please re-modify',
    importError: 'Key value mismatch',
    importRepeatTitle: 'Title repeatedly skipped: {msg}',
    importRepeatContent: 'Content is repeatedly skipped: {msg}',
    onlineImportWarning: 'Note: Please check the JSON file source!',
    downloadError: 'Please check the network status and JSON file validity',
  },


  "mj": {
    "setOpen": "OpenAI Related",
    "setOpenPlaceholder": "Must include http(s)://",
    "setOpenUrl": "OpenAI API Address",
    "setOpenKeyPlaceholder": "Use custom OpenAI Key to bypass password access restrictions",
    "setMj": "Midjourney Related",
    "setMjUrl": "Midjourney API Address:",
    "setMjKeyPlaceholder": "Use custom Api Secret to bypass password access restrictions",
    "setUploader": "Upload Related",
    "setUploaderUrl": "Upload Address:",
    "setBtSave": "Save",
    "setBtBack": "Restore Default",

    "redraw": "Redraw",
  "fail1": "Please be patient, it's loading.",
  "success1": "Image refreshed successfully!",
  "high_variation": "Strong Variation",
  "low_variation": "Weak Variation",
  "p15": "Zoom 1.5x",
  "p20": "Zoom 2x",
  "p100": "Normal",
  "retry": "Retry",
  "pan_left": "Left",
  "pan_right": "Right",
  "pan_up": "Up",
  "pan_down": "Down",
  "up2": "HD 2x",
  "up4": "HD 4x" ,

  "thinking": "Thinking...",
  "noReUpload": "Cannot re-upload",
  "uploading": "Uploading...",
  "uploadSuccess": "Upload successful",
  "uploadFail": "Upload failed:",
  "upPdf": "<span>Upload image or attachment<br/>You can upload images, PDFs, EXCEL, and other documents</span><p>Supports drag and drop</p>",
  "upImg": "<span><b>Upload image</b><br/>Will automatically invoke the gpt-4-vision-preview model<br>Note: Additional image fees may apply<br/>Formats: jpeg, jpg, png, gif</span><p>Supports drag and drop</p> <p class=\"pt-2\"><b>Upload MP3 MP4</b> <br>Will automatically invoke the whisper-1 model<br>Formats: mp3, mp4, mpeg, mpga, m4a, wav, webm</p>",
  "clearAll": "Clear parameters",
  "czoom": "Custom",
  "customTitle": "Custom zoom",
  "zoominfo": "Modify zoom value, range from 1.0 to 2.0, default is set to 1.8",

  "modleSuccess": "Model loaded successfully",
  "setingSuccess": "Settings successful",

  "tokenInfo1": "Remaining Tokens = Model Length - Role Setting - Context (Conversation History) - Replies Count - Current Input",
    "tokenInfo2": "Leave the role setting blank, and the system will provide a default one.",
    "noSuppertModel": "Refresh, this model is not currently supported!",
    "failOcr": "Recognition failed",
    "remain": "Remain:",

  "totalUsage": "Total subscription amount",
  "disableGpt4": "GPT4 disabled",
  "setTextInfo": "OpenAI API Key error, click here to retry",

  "attr1": "Attr",
  "ulink": "Image Link",
  "copyFail": "Copy Failed",
  "tts": "Text to Speech",
  "fail": "Error",
  "noSupperChrom": "Browser not supported!",
  "lang": "Voice",
  "ttsLoading": "Converting to Speech...",
  "ttsSuccess": "Conversion successful",
  "micIng": "Recording, say something...",
  "mStart": "Start",
  "mPause": "Pause",
  "mGoon": "Continue",
  "mRecord": "Re-record",
  "mPlay": "Play",
  "mCanel": "Cancel",
  "mSent": "Send",

  "findVersion": "Discover updated version",
  "yesLastVersion": "Already on the latest version",
  "infoStar": 'This project is open source on <a class="text-blue-600 dark:text-blue-500" href="https://github.com/Dooy/chatgpt-web-midjourney-proxy\" target="_blank">GitHub</a>, free, and based on the MIT license with no form of payment! </p><p>If you find this project helpful, please give it a Star on GitHub, thank you!',
  "setBtSaveChat": "Save chat only",
  "setBtSaveSys": "Save to system",
  "wsrvClose": "Close wsrv",
  "wsrvOpen": "Open wsrv",

  "temperature": "Temperature",
  "temperatureInfo": "As the (temperature) value increases, the responses become more random",
  "top_p": "Top",
  "top_pInfo": "(top_p) is similar to randomness but should not be changed together with temperature",
  "presence_penalty": "Presence",
  "presence_penaltyInfo": "As the (presence_penalty) value increases, there is a higher chance of expanding to new topics",
  "frequency_penalty": "Frequency",
  "frequency_penaltyInfo": "As the (frequency_penalty) value increases, there is a higher likelihood of reducing repeated words",
  "tts_voice": "Voice Role",
  "typing": "Typing",
  "authErro": "Authorization failed",
  "authBt": "Please enter the authorization access password again" ,
  "micWhisper": "Whisper speech recognition",
  "micAsr": "Instant recognition",
  "micRec": "Start recording, please speak! It will automatically stop if there is no sound for 2 seconds.",
  "micRecEnd": "Recording has ended"

  ,subtle: 'High definition 2x'
  ,creative: 'High definition 2x. Creative'
  ,gpt_gx: 'GPTs use g-*'
  
  },
  "mjset": {
    "server": "Server",
    "about": "About",
    "model": "Model",
    "sysname": "AI Drawing"
  },
  "mjtab": {
    "chat": "Chat",
    "draw": "Drawing",
    "drawinfo": "AI Drawing with Midjourney Engine",
    "gallery": "Gallery",
    "galleryInfo": "My Gallery"
  },
  "mjchat": {
    "loading": "Loading Image",
    "openurl": "Open Link Directly",
    "failReason": "Failure Reason:",
    "reload": "Reload",
    "progress": "Progress:",
    "wait": "Task has been submitted, please wait...",
    "reroll": "Redraw",
    "wait2": "Task {id} has been submitted, please wait",
    "redrawEditing": "Partial Redraw Editing",
    "face": "Change Face",
    "blend": "Blend Images",
    "draw": "Drawing",
    "submiting": "Submitting",
    "submit": "Submit",
    "wait3": "Please do not close! Image is being generated...",
    "success": "Save Successful",
    "successTitle": "Success",
    "modlePlaceholder": "Custom models, separated by spaces (optional)",
    "myModle": "Custom Models",
    "historyCnt": "Context Count",
    "historyToken": "More context improves accuracy but consumes more credits",
    "historyTCnt": "Reply Count",
    "historyTCntInfo": "Higher reply count may consume more credits",
    "role": "Role Setting",
    "rolePlaceholder": "Set an exclusive role for your conversation (optional)",
    "loading2": "Loading...",
    "loadmore": "Load More",
    "nofind": "Unable to find",
    "nofind2": "related content. You can try the following:",
    "success2": "Switch Successful!",
    "modelChange": "Model Change",
    "search": "Search",
    "searchPlaceholder": "GPT names, descriptions",
    "attr": "Attachments",
    "noproduct": "Gallery has no entries yet",
    "myGallery": "My Gallery",
    "yourHead": "Your Avatar",
    "your2Head": "Celebrity Image",
    "tipInfo": "Note:<li>1. Images must include faces for proper rendering</li><li>2. 'Celebrity Image' can be created using MJ drawing</li><li>3. 'Celebrity Image' can also include anime characters</li><li>4. 'Your Avatar' is recommended to be a passport-sized personal photo</li>",
    "placeInput": "Please fill in the prompt!",
    "more5sb": "Upload up to 5 images at most",
    "exSuccess": "Export successful... Please check the download folder",
    "downloadSave": "ai_drawing.txt",
    "noproducet": "No mature works for now",
    "imgBili": "Image Ratio",
    "imagEx": "Export Artwork Image Links",
    "prompt": "Prompts",
    "imgCYes": "Contains Base Image",
    "imgCUpload": "Upload Base Image",
    "imgCInfo": "Base Image Info:<br/>1. Use your own images as a base for MJ drawing<br/>2. You can use multiple base images, up to 5, each not exceeding 1M in size",
    "imgCadd": "+Add",
    "del": "Delete",
    "img2text": "Image-to-Text",
    "img2textinfo": "Not sure what prompts to use? Try Image-to-Text! Submit an image to get prompts",
    "traning": "Translating...",
    "imgcreate": "Generate Image",
    "imginfo": "Other parameters:<li>1 --no: Ignore --no car to exclude cars from the image</li><li>2 --seed: Obtain a seed first with --seed 123456</li><li>3 --chaos 10: Mix (range: 0-100)</li><li>4 --tile: Fragmentation</li>",
    "tStyle": "Style",
    "tView": "View",
    "tShot": "Character Shot",
    "tLight": "Lighting",
    "tQuality": "Image Quality",
    "tStyles": "Artistic Level",
    "tVersion": "Model Version",
    "dalleInfo": "Note:<li>1. DALL-E is an image generation model provided by OpenAI</li><li>2. OpenAI images have an expiration date, so make backups</li><li>3. Note: The price of 1790px images is double</li>",
    "version": "Version",
    "size": "Size",
    "blendInfo": "Note:<li>1. Blend at least 2 images</li><li>2. Up to 6 images can be used for blending</li>",
    "blendStart": "Start Blending",
    "no2add": "Do not add duplicate images",
    "add2more": "Please add two or more images",
    "no1m": "Image size cannot exceed 1M",
    "imgExt": "Images support only jpg, gif, png, jpeg formats"
    ,"setSync": "Synchronize Midjourney and Suno"

    ,"addGPTS": "Add GPTs",
    "addPlaceholder": "Paste the GID of the GPTs here or directly paste the link of the GPTs",
    "gidError": "Valid GID not found, please fill in again",
    "success3": "GPTs added successfully!"
  },

	draw: {
		qualityList: {
			general: "General",
			clear: "Clear",
			hd: "HD",
			ultraHd: "Ultra HD",
		},
		styleList: {
			cyberpunk: "Cyberpunk",
			star: "Star",
			anime: "Anime",
			japaneseComicsManga: "Japanese Comics/Manga",
			inkWashPaintingStyle: "Ink Wash Painting Style",
			original: "Original",
			landscape: "Landscape",
			illustration: "Illustration",
			manga: "Manga",
			modernOrganic: "Modern Organic",
			genesis: "Genesis",
			posterstyle: "Poster Style",
			surrealism: "Surrealism",
			sketch: "Sketch",
			realism: "Realism",
			watercolorPainting: "Watercolor Painting",
			cubism: "Cubism",
			blackAndWhite: "Black and White",
			fmPhotography: "Film Photography Style",
			cinematic: "Cinematic",
			clearFacialFeatures: "Clear Facial Features",
		},
		viewList: {
			wideView: "Wide View",
			birdView: "Bird's Eye View",
			topView: "Top View",
			upview: "Upview",
			frontView: "Front View",
			headshot: "Headshot",
			ultrawideshot: "Ultrawide Shot",
			mediumShot: "Medium Shot (MS)",
			longShot: "Long Shot (LS)",
			depthOfField: "Depth of Field (DOF)",
		},
		shotList: {
			faceShot: "Face Shot (VCU)",
			bigCloseUp: "Big Close-Up (BCU)",
			closeUp: "Close-Up (CU)",
			waistShot: "Waist Shot (WS)",
			kneeShot: "Knee Shot (KS)",
			fullLengthShot: "Full Length Shot (FLS)",
			extraLongShot: "Extra Long Shot (ELS)",
		},
		stylesList: {
			styleLow: "Style Low",
			styleMed: "Style Medium",
			styleHigh: "Style High",
			styleVeryHigh: "Style Very High",
		},
		lightList: {
			coldLight: "Cold Light",
			warmLight: "Warm Light",
			hardLighting: "Hard Lighting",
			dramaticLight: "Dramatic Light",
			reflectionLight: "Reflection Light",
			mistyFoggy: "Misty/Foggy",
			naturalLight: "Natural Light",
			sunLight: "Sun Light",
			moody: "Moody",
		},
		versionList: {
			mjV6: "MJ V6",
			mjV52: "MJ V5.2",
			mjV51: "MJ V5.1",
			nijiV6: "Niji V6",
			nijiV5: "Niji V5",
			nijiV4: "Niji V4",
			nijiJourney: "Niji Journey",
		},
		botList: {
			midjourneyBot: "Midjourney Bot",
			nijiJourney: "Niji Journey",
		},
		dimensionsList: {
			square: "Square (1:1)",
			portrait: "Portrait (2:3)",
			landscape: "Landscape (3:2)",
		},
	}

  ,suno:{
    "description": "Description",
    "custom": "Custom",
    "style": "Song Style",
    "stylepls": "Song Name, e.g., Pop Music",
    "emputy": "No content available",
    "noly": "No lyrics available",
    "inputly": "Please enter the song name or lyrics",
    "doingly": "In progress, please wait.",
    "doingly2": "Fetching lyrics...",
    "title": "Song Name",
    "titlepls": "Song Name, e.g., Vacation",
    "desc": "Song Description",
    "descpls": "Song description, e.g., Original pop music about vacation",
    "noneedly": "No lyrics needed",
    "rank": "Random selection",
    "ly": "Lyrics",
    "lypls": "Lyrics: with a certain format",
    "generate": "Compose Song",
    "generately": "Generate Lyrics",
    "nodata": "Please compose first to have a list of songs",

    "menu": "Music",
    "menuinfo": "Suno Music Creation",
    "server": "Suno API Endpoint",
    "serverabout": "Suno Related",
    "setOpenKeyPlaceholder": "Related KEY for Suno API; optional"

    ,upMps:'Upload'
    ,extend:'Extend'
    ,extendFrom:'Extend From'
    ,extendAt:'Extend at'
    ,fail:'Fail'
    ,info:'Note: <br> Uploaded audio must be between 6 seconds and 60 seconds in duration.'
  }
   ,video: {
    menu: "Videos",
    menuinfo: "Luma and other video generate",
    descpls: "Video generate description",
    lumaabout: "About Luma",
    lumaserver: "Luma API endpoint",
    setOpenKeyPlaceholder: "Key for Luma API, optional",
    generate: "Generate video",
    nodata: "No available videos, please generate first!",
    selectimg: "Select image",
    clear: "Clear",
    plsInput: "Please input content!",
    submitSuccess: "Submitted successfully!",
    process: "Video generating...",
    repeat: "Get again",
    pending: 'Status: Queued',
    processing: 'Status: Processing',
    download: 'Download',
    extend: 'Extend'
  },
   
  dance: {
    menu: "Dance",
    menuinfo: "Create dance videos with Viggle and others.",
    character: "Character",
    viggleabout: "About Viggle",
    viggleserver: "Viggle API Endpoint",
    setOpenKeyPlaceholder: "Viggle API key, optional",
    info: "Instructions:<br>1. Character images should preferably be full-body photos.<br>2. Dance template videos should be personal videos, not group dances.",
    model: "Model",
    bgw: "White Background",
    bgg: "Green Background",
    bgmoban: "Original Background",
    bgrole: "Character Background",
    gring: "Generating...",
    uprolefirst: "Please upload character image first",
    uprolefail: "Upload failed",
    upvideo: "+ Upload Template Dance Video",
    usevideo: "+ Use Official Template",
    moban: "Dance Template",
    moban2: "Template Name",
    use: "Use"
  }






}
