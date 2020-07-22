var canvas = {

    canvas: document.getElementById('myCanvas'),
    ctx: null,
    mousePressed: false,
    socket: null,
    controls: {
        line: $('#range').val(),
        color: $('#color').val()
    },
    shape: false,
    lastX: null,
    lastY: null,

    init: () => {
        canvas.ctx = canvas.canvas.getContext("2d");
        canvas.socket = io();
        canvas.bindEvents();
    },
    bindEvents: () => {
        $('#range').change(function(){
            canvas.controls.line = $(this).val();
        });

        $('#color').change(function(){
            canvas.controls.color = $(this).val();
        });

        $('#reset').click(function(){
            canvas.clear();
        });

        $('#square').click(function(){
            shape.type = 'square';
            shape.clear();
            $('#shape').show();
        });

        $('#circle').click(function(){
            shape.type = 'circle';
            shape.clear();
            $('#shape').show();
        });

        $('#download').click(function(){
            var link = document.createElement('a');
            link.download = 'filename.png';
            link.href = canvas.canvas.toDataURL('image/jpeg');
            link.click();
        });

        $(canvas.canvas).mousedown(function(e){
            canvas.mousePressed = true;
            canvas.draw(null,null,e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        });

        $(canvas.canvas).mousemove(function(e){
            if (canvas.mousePressed) {
                canvas.socket.emit('draw', {a:canvas.lastX, b:canvas.lastY, x:e.pageX - $(this).offset().left,y:e.pageY - $(this).offset().top,isdown:true,controls:canvas.controls});
                canvas.draw(canvas.lastX, canvas.lastY, e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
            }
        });

        $(canvas.canvas).mouseup(function(e){
            canvas.mousePressed = false;
        });

        canvas.socket.on('draw', function(data){
            canvas.draw(data.a,data.b,data.x,data.y,data.isdown,data.controls);
        });

        canvas.socket.on('drawShape', function(data){
            canvas.drawShape(data,true);
        });

        canvas.socket.on('clear', function(data){
            canvas.clear(true);
        });
    },
    draw: (a,b,x,y,isDown,controls) => {
        if (isDown) {
            if (!controls) {
                controls = canvas.controls;
            }
            canvas.ctx.beginPath();
            canvas.ctx.strokeStyle = controls.color;
            canvas.ctx.lineWidth = controls.line;
            canvas.ctx.lineJoin = "round";
            canvas.ctx.moveTo(a, b);
            canvas.ctx.lineTo(x, y);
            canvas.ctx.closePath();
            canvas.ctx.stroke();
        }
        canvas.lastX = x; canvas.lastY = y;
    },
    drawShape: (shape,noemit) => {
        switch(shape.type) {
            case 'square':
                canvas.drawSquare(shape.data,shape.controls);
                break;
            case 'circle':
                canvas.drawCircle(shape.data,shape.controls);
                break;
            default:
                break;
        }
        if (!noemit) {
            canvas.socket.emit('drawShape',shape);
        }
    },
    drawSquare: (data,controls) => {
        canvas.ctx.lineWidth = 1;
        canvas.ctx.strokeStyle = controls.color;
        canvas.ctx.beginPath();
        canvas.ctx.rect(data.startX, data.startY, data.endX-data.startX, data.endY-data.startY);
        canvas.ctx.stroke();
    },
    drawCircle: (data,controls) => {
        var centerX = Math.ceil((data.endX - data.startX)/2) + data.startX;
        var centerY = Math.ceil((data.endY - data.startY)/2) + data.startY;
        var radius = Math.abs(Math.min( Math.ceil((data.endX - data.startX)/2), Math.ceil((data.endY - data.startY)/2)));
        canvas.ctx.lineWidth = 1;
        canvas.ctx.strokeStyle = controls.color;
        canvas.ctx.beginPath();
        canvas.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        canvas.ctx.stroke();
    },
    clear: (noemit) => {
        canvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
        canvas.ctx.clearRect(0, 0, canvas.ctx.canvas.width, canvas.ctx.canvas.height);
        if (!noemit) {
            canvas.socket.emit('clear');
        }
    }
};

/**
 * this object allows to draw shapes
 */
var shape = {

    canvas: document.getElementById('shape'),
    ctx: null,
    mousePressed: false,
    type: null,
    data: {},
    lastX: null,
    lastY: null,

    init: () => {
        shape.ctx = shape.canvas.getContext("2d");
        shape.bindEvents();
    },
    bindEvents: () => {
        $(shape.canvas).mousedown(function(e){
            shape.mousePressed = true;
            shape.data.startX = e.pageX;
            shape.data.startY = e.pageY;
        });

        $(shape.canvas).mousemove(function(e){
            if (shape.mousePressed) {
                if (shape.lastX!=null && shape.lastY!=null) {
                    shape.clear();
                }
                shape.data.endX = e.pageX;
                shape.data.endY = e.pageY;
                shape.draw();

                shape.lastX = e.pageX;
                shape.lastY = e.pageY;
            }
        });

        $(shape.canvas).mouseup(function(e){
            shape.mousePressed = false;
            shape.lastX = shape.lastY = null;
            $('#shape').hide();
            canvas.drawShape({type:shape.type,data:shape.data,controls:canvas.controls});
        });
    },
    draw: () => {
        switch(shape.type) {
            case 'square':
                shape.drawSquare(shape.data);
                break;
            case 'circle':
                shape.drawCircle(shape.data);
                break;
            default:
                break;
        }
    },
    drawSquare: (data) => {
        shape.ctx.lineWidth = 1;
        shape.ctx.strokeStyle = canvas.controls.color;
        shape.ctx.beginPath();
        shape.ctx.rect(data.startX, data.startY, data.endX - data.startX, data.endY - data.startY);
        shape.ctx.stroke();
    },
    drawCircle: (data) => {
        var centerX = Math.ceil((data.endX - data.startX)/2) + data.startX;
        var centerY = Math.ceil((data.endY - data.startY)/2) + data.startY;
        var radius = Math.abs(Math.min( Math.ceil((data.endX - data.startX)/2), Math.ceil((data.endY - data.startY)/2)));
        shape.ctx.lineWidth = 1;
        shape.ctx.strokeStyle = canvas.controls.color;
        shape.ctx.beginPath();
        shape.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        shape.ctx.stroke();
    },
    clear: () => {
        shape.ctx.setTransform(1, 0, 0, 1, 0, 0);
        shape.ctx.clearRect(0, 0, shape.ctx.canvas.width, shape.ctx.canvas.height);
    }

};

$(document).ready(function(){
    canvas.init();
    shape.init();
});