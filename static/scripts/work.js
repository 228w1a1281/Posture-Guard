// Variables Declared 
var postureSignal = document.getElementById('postureSignal');
var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var bt = document.getElementById('button');
var context = canvas.getContext('2d');
let pose;
let data;
let detect;
let detect_flag;
let notification;
let constraint = { video: { width: 640, height: 480 } };
let mob = 0;
detect_flag = 0;

// Load function
async function load() {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    console.log('Detector Loaded');
    detect_flag = 1;
    detect = detector;
}  
load(); 

// For mobile view
var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
    canvas.width = 480;
    canvas.height = 640;
    canvas.style.width = "90%";
    mob = 1;
}

// Notifications
if (mob == 0) {
    console.log(Notification.permission);
    if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
    function showNotification(text) {
        notification = new Notification("Posture Guard", { body: text });
    }
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}
var wr = new sound("static/audio/wr_audio.mp3");
var la = new sound("static/audio/la_audio.mp3");
var lt = new sound("static/audio/lt_audio.mp3");

// Accessing the camera feed
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraint).then(function (stream) {
        video.srcObject = stream;
        video.play();
    });
}

// Model
async function Pose() {
    if (detect_flag == 1) {
        const poses = await detect.estimatePoses(video);
        console.log("Estimated poses:", poses); // Log estimated poses for debugging
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Draw selected keypoints
        const keypoints = poses[0].keypoints;

        // Face keypoints: 0 (Nose), 1 (Left Eye), 2 (Right Eye), 3 (Left Ear), 4 (Right Ear)
        const facePoints = [0, 1, 2, 3, 4];
        
        // Shoulders keypoints: 5 (Left Shoulder), 6 (Right Shoulder)
        const shoulderPoints = [5, 6];

        // Draw face keypoints and connections
        for (let i = 0; i < facePoints.length; i++) {
            const point = keypoints[facePoints[i]];
            if (point.score > 0.5) {
                context.beginPath();
                context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                context.fillStyle = "yellow";
                context.fill();
                context.stroke();

                // Draw lines between face points
                if (i > 0) {
                    const previousPoint = keypoints[facePoints[i - 1]];
                    if (previousPoint.score > 0.5) {
                        context.beginPath();
                        context.moveTo(previousPoint.x, previousPoint.y);
                        context.lineTo(point.x, point.y);
                        context.strokeStyle = "yellow";
                        context.lineWidth = 2;
                        context.stroke();
                    }
                }
            }
        }

        // Draw shoulder keypoints and connection
        shoulderPoints.forEach(index => {
            const point = keypoints[index];
            if (point.score > 0.5) {
                context.beginPath();
                context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                context.fillStyle = "yellow";
                context.fill();
                context.stroke();
            }
        });

        // Connect shoulders
        const leftShoulder = keypoints[5];
        const rightShoulder = keypoints[6];
        if (leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
            context.beginPath();
            context.moveTo(leftShoulder.x, leftShoulder.y);
            context.lineTo(rightShoulder.x, rightShoulder.y);
            context.strokeStyle = "yellow";
            context.lineWidth = 2;
            context.stroke();
        }
    }
}

// Handle posture states
function handlePostureState(jsonresult) {
    console.log("State:", jsonresult.state, "Message:", jsonresult.msg); // Log state and message
    switch (jsonresult.state) {
        case 1: // Bad posture
            bt.style.backgroundColor ='#f44336';
            postureSignal.style.backgroundColor = 'red'; // Change to red for bad posture
            if (jsonresult.msg == 1) {
                if (mob == 0) {
                    showNotification("Please Sit Straight");
                    setTimeout(function () { notification.close(); }, 2000);
                }
                wr.play();
            }
            break;
        case 2: // Leaning towards screen
            bt.style.backgroundColor = '#3be2ff'; // Light blue for the button
            postureSignal.style.backgroundColor = '#3be2ff'; // Light blue for posture signal
            if (jsonresult.msg == 1) {
                if (mob == 0) {
                    showNotification("Don't Lean Towards Screen");
                    setTimeout(function () { notification.close(); }, 2000);
                }
                lt.play();
            }
            break;
        case 3: // Leaning away from screen
            bt.style.backgroundColor ='#000000';
            postureSignal.style.backgroundColor = 'black'; // Change to black for leaning away
            if (jsonresult.msg == 1) {
                if (mob == 0) {
                    showNotification("Don't Lean Away from Screen");
                    setTimeout(function () { notification.close(); }, 2000);
                }
                la.play();
            }
            break;
        case 0: // Good posture
            bt.style.backgroundColor ='#04caf50';
            postureSignal.style.backgroundColor = 'green'; // Change to green for good posture
            break;
        default:
            postureSignal.style.backgroundColor = 'grey'; // Default color if state is unknown
    }
}

// Main loop function
async function dope() {
    if (detect_flag == 1) {
        const poses = await detect.estimatePoses(video);
        pose = poses[0].keypoints.slice(0, 7); // Use keypoints 0-6 (but only drawing 0-6 above)
        pose = { 0: pose[0], 1: pose[1], 2: pose[2], 3: pose[3], 4: pose[4], 5: pose[5], 6: pose[6], 7: mob };
        data = JSON.stringify(pose);

        $.ajax({
            type: 'GET',
            url: "/image_info",
            data: { 'data': data },
            success: function (jsonresult) {
                console.log("Response:", jsonresult); // Log the response
                handlePostureState(jsonresult); // Update the posture state
            },
            error: function (error) {
                console.error("Server error: ", error);
            }
        });
    }
}
// Toggle button actions 
var myVar = setInterval(Pose, 100);
var myVar2 = setInterval(dope, 2500);
let flag = true;

document.getElementById("button").addEventListener("click", function() {
    if (flag) {
        clearInterval(myVar);
        clearInterval(myVar2);
        document.getElementById("text").innerHTML = "Resume";
        flag = false;

        // Ask the user if they want to take a chill break
        if (confirm("Do you want to take a chill break?")) {
            showYouTubeVideos(); // Show the YouTube video
            showNotification("It's time to take a chill break!");
        } else {
            document.getElementById("text").innerHTML = "Resume";
            flag = true; // Reset the flag to allow resuming
        }
    } else {
        document.getElementById("text").innerHTML = "Pause";
        myVar = setInterval(Pose, 100);
        myVar2 = setInterval(dope, 2500);
        flag = true;

        // Hide YouTube video when resumed
        document.getElementById('youtube-container').innerHTML = '';
    }
});

// Function to load the YouTube video
function showYouTubeVideos() { 
    const youtubeContainer = document.getElementById("youtube-container");
    youtubeContainer.innerHTML = `
        <iframe width="560" height="315" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>`;
}

// Function to show notifications
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "toast";
    notification.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Posture Alert</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(notification);
    $('.toast').toast({ autohide: true, delay: 2000 });
    $('.toast').toast('show');
}

// Chill area
function chill() {
    $('.container').fadeToggle("900");
    $('#chill').fadeToggle("3500").css({ "display": "flex", "justify-content": "center", "align-items": "center", "flex-direction": "column" });
}
function btw() {
    $('#chill').fadeToggle();
    $('.container').fadeToggle("slow").css("display", "flex");
}

// SideBar
function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("mySidebar").style.height = "50rem";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    $(".ic").html(`<img role="button" onclick="closeNav()" src="/static/close-button.png" alt="#">`);
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("mySidebar").style.height = "0";
    document.body.style.backgroundColor = "white";
    $(".ic").html(`<img role="button" onclick="openNav()" src="/static/hamburger.png" alt="#">`);
}


