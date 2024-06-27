"use strict";

// Inicialización del contexto de audio
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyserVoz = audioContext.createAnalyser();
let analyserGuitarra = audioContext.createAnalyser();
analyserVoz.fftSize = 2048;
analyserGuitarra.fftSize = 2048;
let bufferLength = analyserVoz.frequencyBinCount;
let dataArrayVoz = new Uint8Array(bufferLength);
let dataArrayGuitarra = new Uint8Array(bufferLength);

// Elementos del DOM
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const canvasVoz = document.getElementById('canvas-voz');
const ctxVoz = canvasVoz.getContext('2d');
const canvasGuitarra = document.getElementById('canvas-guitarra');
const ctxGuitarra = canvasGuitarra.getContext('2d');
const canvasNotas = document.getElementById('canvas-notas');
const ctxNotas = canvasNotas.getContext('2d');

// Control de grabación
let mediaStream;
let microphone;
let guitarSource;

startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaStream = stream;
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyserVoz);
            startButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
            capturarFrecuencias();
        })
        .catch(error => console.error('Error al acceder al micrófono:', error));
}

function stopRecording() {
    mediaStream.getTracks().forEach(track => track.stop());
    microphone.disconnect();
    stopButton.style.display = 'none';
    startButton.style.display = 'inline-block';
}

function capturarFrecuencias() {
    requestAnimationFrame(capturarFrecuencias);
    analyserVoz.getByteFrequencyData(dataArrayVoz);
    analyserGuitarra.getByteFrequencyData(dataArrayGuitarra);
    dibujar();
}

function dibujar() {
    ctxVoz.clearRect(0, 0, canvasVoz.width, canvasVoz.height);
    ctxGuitarra.clearRect(0, 0, canvasGuitarra.width, canvasGuitarra.height);
    ctxNotas.clearRect(0, 0, canvasNotas.width, canvasNotas.height);

    // Visualización de la voz
    ctxVoz.fillStyle = 'green';
    for (let i = 0; i < bufferLength; i++) {
        let x = i * (canvasVoz.width / bufferLength);
        let height = canvasVoz.height * (dataArrayVoz[i] / 255);
        ctxVoz.fillRect(x, canvasVoz.height - height, 1, height);
    }

    // Visualización de la guitarra
    ctxGuitarra.fillStyle = 'red';
    for (let i = 0; i < bufferLength; i++) {
        let x = i * (canvasGuitarra.width / bufferLength);
        let height = canvasGuitarra.height * (dataArrayGuitarra[i] / 255);
        ctxGuitarra.fillRect(x, canvasGuitarra.height - height, 1, height);
    }

    // Visualización de la escala de notas
    dibujarNotas();
}

function dibujarNotas() {
    ctxNotas.fillStyle = '#f0f0f0';
    ctxNotas.fillRect(0, 0, canvasNotas.width, canvasNotas.height);

    let notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let step = canvasNotas.width / notas.length;
    ctxNotas.fillStyle = 'black';
    notas.forEach((nota, index) => {
        let x = step * index;
        ctxNotas.fillText(nota, x + 10, canvasNotas.height / 2);
    });

    // Aquí puedes añadir lógica para mostrar la frecuencia actual y comparar con la guitarra
    // Ejemplo de cómo visualizar las notas:
    // let frecuenciaActual = obtenerFrecuenciaActual(); // Implementa esta función
    // let notaCorrespondiente = convertirAFrecuenciaANota(frecuenciaActual);
    // ctxNotas.fillStyle = 'blue';
    // ctxNotas.fillText(notaCorrespondiente, canvasNotas.width / 2, canvasNotas.height / 2);
}

// Función para convertir frecuencia a nota musical (simplificada)
function convertirAFrecuenciaANota(frecuencia) {
    let notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let noteIndex = Math.round((12 * Math.log2(frecuencia / 440.0)) + 69);
    return notas[noteIndex % 12];
}

