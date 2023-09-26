document.addEventListener("DOMContentLoaded", function () {
    const startRecordingButton = document.getElementById("startRecording");
    const stopRecordingButton = document.getElementById("stopRecording");
    const downloadButton = document.getElementById("downloadVideo");
    const closeRecordingButton = document.getElementById("closeRecording");
    const recordedVideo = document.getElementById("recordedVideo");
    let mediaRecorder;
    let recordedChunks = [];
    let audioStream;

    startRecordingButton.addEventListener("click", startRecording);
    stopRecordingButton.addEventListener("click", stopRecording);
    downloadButton.addEventListener("click", downloadVideo);
    closeRecordingButton.addEventListener("click", closeRecording);

    async function startRecording() {
        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Combine video and audio streams
            const streams = [displayStream, microphoneStream];
            audioStream = new MediaStream();

            streams.forEach((stream) => {
                stream.getAudioTracks().forEach((track) => {
                    audioStream.addTrack(track);
                });
            });

            // Initialize the media recorder with the combined stream
            mediaRecorder = new MediaRecorder(new MediaStream([...displayStream.getTracks(), ...audioStream.getTracks()]));
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                recordedChunks = [];
                recordedVideo.src = URL.createObjectURL(blob);
                recordedVideo.controls = true;
                downloadButton.disabled = false;
                closeRecordingButton.disabled = false;
            };

            mediaRecorder.start();

            startRecordingButton.disabled = true;
            stopRecordingButton.disabled = false;
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            audioStream.getTracks().forEach((track) => {
                track.stop();
            });
            startRecordingButton.disabled = false;
            stopRecordingButton.disabled = true;
        }
    }

    function downloadVideo() {
        if (recordedVideo.src) {
            const a = document.createElement("a");
            a.href = recordedVideo.src;
            a.download = "recorded-video.webm";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    function closeRecording() {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            audioStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        recordedVideo.src = "";
        downloadButton.disabled = true;
        closeRecordingButton.disabled = true;
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = false;
    }
});
