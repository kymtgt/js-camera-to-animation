/****************************
 * 撮影
 ****************************/
const video = document.querySelector('#video');
const player = document.querySelector('#player');
const canvas = document.createElement('canvas');
let mediaRecorder;
let photoIndex = 0;

let audioElm = new Audio('shutter-sound.mp3');

initVideoCamera();
initPhoto();
const shootButton = document.querySelector('#shoot');
shootButton.addEventListener('click', photoShoot);
const resetButton = document.querySelector('#reset');
resetButton.addEventListener('click', initPhoto);
const previewButton = document.querySelector('#preview');
previewButton.addEventListener('click', startPreview);
const pauseButton = document.querySelector('#pause')
pauseButton.addEventListener('click', pausePreview);
const retakeButton = document.querySelector('#stop')
retakeButton.addEventListener('click', stopPreview);

/**
 * ビデオのカメラ設定(デバイスのカメラ映像をビデオに描画)
 */
function initVideoCamera() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
      mediaRecorder = new MediaRecorder(stream);
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
  context.fillStyle = "#222";
  context.fillRect(0, 0, canvas.width, canvas.height);
  photoIndex = 0;
  sequence.innerHTML = "";
  addFrame();
  updateSelectedOutline();
}

/**
 * フレーム追加
 */
function addFrame() {
  const photo = new Image();
  photo.dataset.index = photoIndex;
  photo.classList.add("photo","selected");
  photo.addEventListener('click', clickSequence);
  sequence.appendChild(photo);
}

/**
 * 写真の撮影描画
 */
function photoShoot() {
  audioElm.pause();
  audioElm.currentTime = 0;
  audioElm.play();
  let drawSize = calcDrawSize();
  canvas.width = drawSize.width;
  canvas.height = drawSize.height;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  document.querySelector("#sequence .photo[data-index=\""+photoIndex+"\"]").src = canvas.toDataURL("image/png");
  photoIndex += 1;
  if(photoIndex == document.querySelectorAll("#sequence .photo").length) {
    addFrame();
  }
  updateSelectedOutline();
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



/****************************
 * プレビュー
 ****************************/
let previewState = 0
let previewInterval;
let currentPreviewIndex = 0;
let prevPreviewIndex;
let frameLength = 1;
window.intervalSec = 500;

/**
 * プレビュー開始
 */
function startPreview() {
  if(previewState == 0) {
    initPlayer();
  }
  runPreview();
}

/**
 * プレイヤーの初期化
 */
function initPlayer() {
  video.classList.add('hidd');
  player.classList.remove('hidd');
  shootButton.classList.add('hidd');
  resetButton.classList.add('hidd');
  retakeButton.classList.remove('hidd');
  currentPreviewIndex = 0;
  prevPreviewIndex = null;
  frameLength = document.querySelectorAll("#sequence .photo").length - 1
}

/**
 * プレビュー実行
 */
function runPreview() {
  previewState = 1;
  previewButton.classList.add('hidd');
  pauseButton.classList.remove('hidd');
  // まず1フレーム目の表示
  const clone = document.querySelector("#sequence .photo[data-index=\""+currentPreviewIndex+"\"]").cloneNode(true);
  player.appendChild(clone);
  prevPreviewIndex = currentPreviewIndex;

  // intervalSecごとにフレーム書き換え
  previewInterval = setInterval(function() {
    const clone = document.querySelector("#sequence .photo[data-index=\""+currentPreviewIndex+"\"]").cloneNode(true);
    player.appendChild(clone);
    prevPreviewIndex = currentPreviewIndex;
    if(currentPreviewIndex < frameLength - 1) {
      currentPreviewIndex += 1;
    } else {
      currentPreviewIndex = 0;
    }
  }, intervalSec);
}

/**
 * プレビュー一時停止
 */
function pausePreview() {
  previewState = 2;
  pauseButton.classList.add('hidd');
  previewButton.classList.remove('hidd');
  clearInterval(previewInterval);
  previewInterval = null;
}

/**
 * プレビュー修了
 */
function stopPreview() {
  previewState = 0;
  // フレーム実行の停止
  clearInterval(previewInterval);
  previewInterval = null;

  // 画面を撮影モードに戻す
  player.classList.add('hidd');
  player.innerHTML = "";
  video.classList.remove('hidd');
  previewButton.classList.remove('hidd');
  pauseButton.classList.add('hidd');
  shootButton.classList.remove('hidd');
  resetButton.classList.remove('hidd');
  retakeButton.classList.add('hidd');
}

/**
 * シーケンスのフレームを選択したとき
 */
function clickSequence(e) {
  photoIndex = parseInt(e.target.dataset.index);
  updateSelectedOutline();
}

/**
 * シーケンスのカレントを表すアウトライン描画更新
 */
function updateSelectedOutline() {
  document.querySelector("#sequence .selected").classList.remove("selected");
  document.querySelector("#sequence .photo[data-index=\""+photoIndex+"\"]").classList.add("selected");
}