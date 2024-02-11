const video = document.querySelector('#video');
const canvas = document.createElement('canvas');
let mediaRecorder;
const movie = document.querySelector('#movie');

initVideoCamera();
initPhoto();
document.querySelector('#shoot').addEventListener('click', photoShoot);
document.querySelector('#recode-start').addEventListener('click', recodeStart);
document.querySelector('#recode-stop').addEventListener('click', recodeStop);

/**
 * ビデオのカメラ設定(デバイスのカメラ映像をビデオに描画)
 */
function initVideoCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.addEventListener('dataavailable', e => movie.src = URL.createObjectURL(e.data));
        })
        .catch(e => console.log(e));
}

/**
 * 写真の初期描画
 */
function initPhoto() {
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
    document.querySelector("#photo").src = canvas.toDataURL("image/png");
}

/**
 * 写真の撮影描画
 */
function photoShoot() {
    let drawSize = calcDrawSize();
    canvas.width = drawSize.width;
    canvas.height = drawSize.height;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    document.querySelector("#photo").src = canvas.toDataURL("image/png");
}

/**
 * 描画サイズの計算
 * 縦横比が撮影(video)が大きい時は撮影の縦基準、それ以外は撮影の横基準で計算
 */
function calcDrawSize() {
    let videoRatio = video.videoHeight / video.videoWidth;
    let viewRatio = video.clientHeight / video.clientWidth;
    return videoRatio > viewRatio ?
        { height: video.clientHeight, width: video.clientHeight / videoRatio }
        : { height: video.clientWidth * videoRatio, width: video.clientWidth }
}

/**
 * 動画撮影の開始
 */
function recodeStart() {
    mediaRecorder.start();
    document.querySelector('#recode-start').classList.add('hidd');
    document.querySelector('#recode-stop').classList.remove('hidd');
}

/**
 * 動画撮影の停止
 */
function recodeStop() {
    mediaRecorder.stop();
    document.querySelector('#recode-start').classList.remove('hidd');
    document.querySelector('#recode-stop').classList.add('hidd');
}
