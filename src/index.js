//import Agora SDK
import './index.css'

import Video from './Video/Video'
import Controls from './Controls/Controls'


let client = AgoraRTC.createClient({mode: 'rtc', codec: "h264"});

Video(client);