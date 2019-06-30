import './Video.css'
import AgoraRTC from 'agora-rtc-sdk'


let remoteContainer = document.getElementById("remote");
let remoteMinimized = document.getElementById("minimized-remote");
let remotes=[];

/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId){
    remotes.push(streamId);
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=String(streamId);                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    if (remotes.length>1){
        streamDiv.className="minimized-video video-margin";
        remoteMinimized.appendChild(streamDiv);      // Add new div to container
    }
    else {
        streamDiv.style.height = '100%';
        remoteContainer.appendChild(streamDiv);      // Add new div to container
    }
}

/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {
    console.log("remove video-stream called");
    let stream = evt.stream;
    if(stream){
        stream.close();
        remotes = remotes.filter(e => e!==stream.getId());
        // console.log('remove ',stream.getId(), remotes);
        let remDiv=document.getElementById(stream.getId());
        remDiv.parentNode.removeChild(remDiv);
        console.log("Remote stream is removed " + stream.getId());
    }
}

/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err){
    console.log("Error : ", err);
};



/**
 * @name handleFail
 * @param client - RTC Client
 * @description Function takes in a client and returns a promise which will resolve {localStream and client}
 */
export default function video(client,appid) {

    let resolve;

    client.init(appid,function () {
        console.log("initialized");
    },handleFail);



    client.join(null,'channel-x',null,(uid)=>{
        let localStream = AgoraRTC.createStream({
            streamID:uid,
            audio:true,
            video:true,
            screen:false
        });

        localStream.init(function () {
            localStream.play('me');
            client.publish(localStream,handleFail);

            resolve({localStream,client});
        },handleFail)
    },handleFail);

    client.on('stream-added',function (evt) {

        client.subscribe(evt.stream,handleFail)
    });
    client.on('stream-subscribed',function(evt){
        let stream = evt.stream;
        addVideoStream(stream.getId());
        stream.play(String(stream.getId()));
    });
    client.on('stream-removed',removeVideoStream);
    client.on('peer-leave',removeVideoStream);

    return new Promise((res,rej)=>{resolve=res});
}