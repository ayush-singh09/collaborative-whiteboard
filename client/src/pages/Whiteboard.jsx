import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../utils/socket";
import { LuEraser } from "react-icons/lu";
import { IoBrushOutline } from "react-icons/io5";
import axios from "axios";

const WhiteBoard = () => {
  const { roomid } = useParams();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);

  const presetColors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#000080",
    "#008000",
    "#800000",
  ];

  // socekt.io connection
  useEffect(() => {
    if (roomid) {
      socket.emit("join-room", roomid);
      console.log(`Joined room: ${roomid}`);
    }

    socket.on("user-joined", (userId) => {
      console.log(`➕🧸 ${userId}`);
    });

    socket.on("receive-drawing", (data) => {
      const savedImage = data.data;
      const image = new Image();
      image.onload = () => contextRef.current.drawImage(image, 0, 0);
      image.src = savedImage;
    });

    socket.on("clear-canvas", () => {
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const getImage = async () => {
    await axios
      .get(
        `https://collaborative-whiteboard-ysxd.onrender.com/api/room/${roomid}`
      )
      .then((res) => {
        if (res.data?.error == "Room not found") {
          alert("Room not found");
          window.open("/", "_self");
        } else {
          const savedImage = res.data.data.image;
          const image = new Image();
          image.onload = () => contextRef.current.drawImage(image, 0, 0);
          image.src = savedImage;
        }
      })
      .catch((err) => {
        console.log("Error fetching image:", err);
      });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;
    getImage();
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const sendData = () => {
    const image = canvasRef.current.toDataURL();
    socket.emit("send-drawing", {
      roomid: roomid,
      type: "stroke",
      data: image,
      color,
      lineWidth,
    });
    console.log("✅ Data sent");
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = (e) => {
    contextRef.current.closePath();
    setIsDrawing(false);
    sendData();
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    socket.emit("clear", {
      roomid: roomid,
      type: "clear",
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex h-[8%] w-full items-center gap-4 bg-[white] px-5">
        <div className="flex  items-center gap-1">
          <IoBrushOutline color="black" size={20} />
          <label className="text-black">Size:{lineWidth}px</label>
        </div>
        <input
          className="slider h-2 rounded-lg appearance-none cursor-pointer"
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          onInput={(e) => setValue(e.target.value)}
          style={{
            background: `linear-gradient(to right, ${color} ${
              lineWidth * 5
            }%, #e5e7eb ${lineWidth * 5}%)`, // gray-200
          }}
        />
        <div className="flex gap-2 items-center">
          {presetColors.map((c) => (
            <button
              className={`h-5 w-5 rounded-full outline-none`}
              key={c}
              onClick={() => setColor(c)}
              style={{
                backgroundColor: c,
                color: "white",
                border: color === c ? "2px solid black" : "none",
                cursor: "pointer",
              }}
            ></button>
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
          }}
        />
        <button className="btn bg-[#EF4444] border-none" onClick={clearCanvas}>
          <LuEraser /> Clear
        </button>
      </div>
      <div className="h-[92%] bg-[#b9b8b8] flex items-center justify-center relative">
        <img
          className="h-full w-full object-cover"
          src="https://cdn.pixabay.com/photo/2016/12/30/19/33/children-1941336_1280.png"
          alt=""
        />
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="h-[600px] w-[1000px] cursor-crosshair bg-white absolute"
        />
      </div>
    </div>
  );
};

export default WhiteBoard;
