"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    // canvas.width = 480;
    // canvas.height = 320;

    const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawCircle = (x, y) => {
        // ctx.beginPath();
        // ctx.ellipse(x, y, 25, 25, 0, 0, 2 * Math.PI);
        // ctx.fillType = 
        // ctx.fill();
        // ctx.closePath();
    }

    canvas.addEventListener('mousemove', function(event) {
        clear();
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        drawCircle(mouseX, mouseY);
    });
});
