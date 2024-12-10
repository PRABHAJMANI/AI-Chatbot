import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import Editor from "@monaco-editor/react";
import axios from "axios";
import MicOff from "./prebuilt/MicOff";
import MicOn from "./prebuilt/MicOn";
import ScreenShare from "./prebuilt/ScreenShare";
import EndCallIcon from "./prebuilt/EndCallIcon";
import WebCamOnIcon from "./prebuilt/WebCamOnIcon";
import WebCamOffIcon from "./prebuilt/WebCamOffIcon";
import WhiteboardIcon from "./prebuilt/WhiteboardIcon";
import Chat from "./prebuilt/Chat";
import CodeEditorIcon from "./prebuilt/CodeEditorIcon";
import { ReactSketchCanvas } from "@shawngoh87/react-sketch-canvas";
import { FaComments, FaClipboardList } from 'react-icons/fa';
import { IoMdSend } from "react-icons/io";

import "../styles/combined.css";
import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    usePubSub,
    useTranscription,
    Constants
  } from "@videosdk.live/react-sdk";
  import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

// This is the Auth token, you will use it to generate a meeting and connect to it

// API call to create a meeting

export default function Videocall(){
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const socket = useRef(null);
  const pingTimeoutRef = useRef(null);
  const resetPingTimeout = () => {
    clearTimeout(pingTimeoutRef.current);
    pingTimeoutRef.current = setTimeout(() => {
      socket.current.emit('ping');
      console.log('Ping sent to server');
      resetPingTimeout();
      // Call resetPingTimeout() again here if you want the ping to continue after the first ping
      // But this should usually be triggered by another event rather than here.
    }, 3000);
  };
    useEffect(() => {
      socket.current = io('http://localhost:3000', { transports: ['websocket'] });
        // Listen for messages from the server


        const sendPing = () => {
          socket.current.emit('ping');
          console.log('Ping sent to server');
      };

      // Reset and setup the ping timeout
      
        socket.current.on('connect', () => {
          console.log("connected");
          resetPingTimeout();

        });
        
        
        socket.current.on('message', (data) => {
          console.log('Received response from server:', data);
          resetPingTimeout();

        });
    
        return () => {
          // Cleanup
          clearTimeout(pingTimeoutRef.current);
          if (socket.current) {
              socket.current.off('connect');
              socket.current.off('message');
              socket.current.close();
          }
      };
  }, []);
    
    const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIyMjc4MGRmMC0xNTYzLTQ2NTAtODI1MC03Mjg4Y2Y2NTEyZGUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcyMDY3NzA1OSwiZXhwIjoxODc4NDY1MDU5fQ.tBl8ARqT7-y02_mWe57AlmomD_RB3TWNQEn9sJVI9vw";

    const [meetingId, setMeetingId] = useState(null);
    const [roomId, setRoomId] = useState(null);

 const createMeeting = async () => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      authorization: `${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  console.log(res);
  const { roomId } = await res.json();
  return roomId;
};


const Message = ({showMessages}) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [transcipt_msgs, setTranscript_msgs] = useState([]);
  const [view, setView] = useState("chat");
  const audioRef = useRef();

  useEffect(() => {
    // Function to handle incoming messages from AI
    const messageListener = async (aiMessage) => {
        const { text, audio } = aiMessage;
        const aiMessageText = { sender: "ai", text: text };

        setTranscript_msgs((prevTranscript_msgs) => [...prevTranscript_msgs, aiMessageText]);
        if (audio) {
            const audioBlob = new Blob([new Uint8Array(audio)], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;
            try {
                await audioRef.current.play();
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }
       resetPingTimeout();
    };
    const messageListenerChat = async (aiMessage) => {
        const { text, audio } = aiMessage;
        const aiMessageText = { sender: "ai", text: text };
        setMessages((prevMessages) => [...prevMessages, aiMessageText]);
        setTranscript_msgs((prevTranscript_msgs) => [...prevTranscript_msgs, aiMessageText]);
        if (audio) {
            const audioBlob = new Blob([new Uint8Array(audio)], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;
            try {
                await audioRef.current.play();
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }
       resetPingTimeout();
    };


    if (socket.current) {
        socket.current.on("messageAIbot", messageListener);
        socket.current.on("messageAIbotChatRes", messageListenerChat);
        socket.current.emit("initLoad", {message: "hi", type: `${type}`}); // Send initial "hi"
        resetPingTimeout();        
        console.log("hi sent");
    }

    return () => {
        if (socket.current) {
            socket.current.off("messageAIbot", messageListener);
        }
    };
}, []); // Empty dependency array ensures this effect runs only once



const handleUserInput = () => {
    const userMessage = { sender: "user", text: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setTranscript_msgs((prevTranscript_msgs) => [...prevTranscript_msgs, userMessage]);
    if (socket.current) {
        socket.current.emit("messageAIbotChatSend", userInput);
        resetPingTimeout();  
      }
    setUserInput("");
};

return (
  <div className={`vall_chatContainer ${showMessages ? 'show' : ''}`}>
      <audio ref={audioRef}></audio>
      <div className="vall_buttonContainer">
          <button
              className={`vall_button ${view === "chat" ? 'active' : ''}`}
              onClick={() => setView("chat")}
          >
            <FaComments />  Chat
          </button>
          <button
              className={`vall_button ${view === "transcript" ? 'active' : ''}`}
              onClick={() => setView("transcript")}
          >
            <FaClipboardList />  Transcript
          </button>
      </div>
      {view === "chat" && (
        <div className="vall_chatBox">
          {messages.map((message, index) => (
              <div key={index} className={`vall_message ${message.sender}`}>
                  <p>{message.text}</p>
              </div>
          ))}
        </div>
      )}
      {view === "transcript" && (
        <div className="vall_chatBox">
          {transcipt_msgs.map((message, index) => (
              <div key={index} className={`vall_message ${message.sender}`}>
                <p>{message.text}</p>
              </div>
          ))}
        </div>
      )}
      {view === "chat" && (
        <div className="vall_inputContainer">
          <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button 
      className="vall_button" 
      onClick={handleUserInput}
      style={{
        fontSize: '1.5rem',
        padding: '0.5rem 1rem',
        width: '4rem',
        height: '3rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <IoMdSend />
    </button>
        </div>
      )}
  </div>
);
};



const WhiteboardView = () => {
  const canvasRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [currentTool, setCurrentTool] = useState('pen');
  const {localParticipant}=useMeeting(); // Using a single state to manage the tool
  const downloadModifiedImage = async () => {
    if (!canvasRef.current) return;

    // Step 1: Save current paths
    const originalPaths = await canvasRef.current.exportPaths();

    // Step 2: Clear the canvas and redraw all paths with white strokes
    

    // Step 3: Export the modified canvas
    canvasRef.current.exportImage('image/png').then(async dataUrl => {
      console.log("Modified Image with White Paths:", dataUrl);
      // Handle the data URL, e.g., send via socket or download
      if(socket.current){
      socket.current.emit("sendImage",dataUrl);
      resetPingTimeout();
          }
      // After export, restore original paths inside the then() to ensure order
    

    }).catch(error => {
      console.error("Failed to export modified canvas:", error);
    });
};

const { publish } = usePubSub("WHITEBOARD", {
    onMessageReceived: (message) => {
      console.log("Message received", message);
      if (message.senderId !== localParticipant?.id) {
        canvasRef.current.loadPaths(JSON.parse(message.message));
      }
    },
    onOldMessagesReceived: (messages) => {
      console.log("Old messages received", messages);
      messages.forEach((message) => {
        canvasRef.current.loadPaths(JSON.parse(message.message));
      });
    },
  });

   useEffect(() => {
    const canvas = canvasRef.current?.canvasContainer?.querySelector('canvas');
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvasRef.current.redraw();
      };
      img.src = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Graph_paper_scan_1600x1000_%286509259561%29.jpg';
    }
  }, [canvasRef]);

  const toggleTool = (tool) => {
    setCurrentTool(tool);
    setStrokeColor(tool === 'pen' ? '#000000' : '#FFFFFF'); // Adjusting this to correctly switch colors
  };

  const undo = () => {
    canvasRef.current.undo();
  };

  const redo = () => {
    canvasRef.current.redo();
  };

  const clear = async () => {
    canvasRef.current.clearCanvas();
  };

  const onStroke = async (stroke, isEraser) => {
    console.log("onStroke called with stroke:", stroke);
    publish(JSON.stringify(stroke),{persist:true})
  };

  const canvasProps = {
    width: "100%",
    height: "500px",
    preserveBackgroundImageAspectRatio: "none",
    strokeWidth,
    strokeColor,
    canvasColor: "#FFFFFF",
    allowOnlyPointerType: "all",
    withViewBox: false,
  };

  return (
    <div className="whiteboard">
      <div className="whiteboard-tools">
        <button className="wb_button" onClick={clear}>Clear</button>
        <button className="wb_button" onClick={() => toggleTool('eraser')} disabled={currentTool === 'eraser'}>Eraser</button>
        <button className="wb_button" onClick={() => toggleTool('pen')} disabled={currentTool === 'pen'}>Pen</button>
        <button className="wb_button" onClick={undo}>Undo</button>
        <button className="wb_button" onClick={redo}>Redo</button>
        <button className="wb_button" onClick={downloadModifiedImage}>Send</button>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(e.target.value)}
          className="stroke-width-slider"
        />
        <input
          type="color"
          className="wb_input_color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          disabled={currentTool === 'eraser'}
        />
      </div>
      <div className="whiteboard-canvas">
        <ReactSketchCanvas ref={canvasRef} {...canvasProps}  onStroke={onStroke}/>
      </div>
    </div>
  );
};


const Controls = ({ onCodeEditorClick,onWhiteboardClick,onMessageClick }) => {
  const navigate = useNavigate();
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  const [isMicOn, setIsMicOn] = useState(false);
  const audioRef = useRef(new Audio());
  const [transcriptionText, setTranscriptionText] = useState(null);
  const [isWebCamOn, setIsWebCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  useEffect(() => {
    if (isMicOn) {
      startRecording();
      // startTranscription();
    } else {
      stopRecording();
      // stopSpeaking();
    }
  }, [isMicOn]);

  
  function onTranscriptionStateChanged(data) {
    const { status, id } = data;
    if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTING) {
      console.log("Realtime Transcription is starting", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STARTED) {
      console.log("Realtime Transcription is started", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPING) {
      console.log("Realtime Transcription is stopping", id);
    } else if (status === Constants.transcriptionEvents.TRANSCRIPTION_STOPPED) {
      console.log("Realtime Transcription is stopped", id);
    }
  }

  function onTranscriptionText(data) {
    let { participantId, participantName, text, timestamp, type } = data;
    setTranscriptionText(text);
    console.log(`${participantName}: ${text} ${timestamp} ${type}`);
  }

  async function stopSpeaking() {
    stopTranscription();
    console.log(transcriptionText);
    socket.emit('sendAudio', transcriptionText);


    // const postData = {
    //   text_prompt: transcriptionText,
    // };

    // try {
    //   const response = await axios.post('http://localhost:3000/api/v1/process_text', postData, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
    //   const { text, audio } = response.data;

    //   const audioBlob = new Blob([new Uint8Array(audio.data)], { type: 'audio/mp3' });
    //   const audioUrl = URL.createObjectURL(audioBlob);
    //   audioRef.current.src = audioUrl;
    //   await audioRef.current.play().catch((error) => {
    //     console.error('Error playing audio:', error);
    //   });
    // } catch (error) {
    //   console.error('Error processing API to backend:', error);
    // }
  }

  const { startTranscription, stopTranscription } = useTranscription({
    onTranscriptionStateChanged,
    onTranscriptionText,
  });

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();

    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
        if(socket.current){
        socket.current.emit('sendAudio', audioBlob);
        resetPingTimeout();
        console.log(file);
          }

    };

    setRecording(true);
};

const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleLeave = async() => {

    try {
        const response = await axios.get('http://localhost:3000/api/v1/end');
        console.log(response.data);
        leave();
        navigate("/feedback", { state: { feedback: response.data } });
    } catch (error) {
      console.error('Error processing API to backend:', error);
    }
  }
  
  const toggleMicState = () => {
    toggleMic();
    setIsMicOn((prev) => !prev);
  };

  const toggleWebCamState = () => {
    toggleWebcam();
    setIsWebCamOn((prev) => !prev);
  };

  const toggleScreenShareState = () => {
    setIsScreenSharing((prevState) => !prevState);
  };

  const handleCodeEditorClick = () => {
    onCodeEditorClick();
  };

  return (
    <div className="controls-container">
      <button className="control-button" onClick={handleLeave}>
        <EndCallIcon fill="red" />
      </button>
      <button className="control-button" onClick={toggleMicState}>
        {isMicOn ? <MicOn color="green" /> : <MicOff color="red" />}
      </button>
      <button className="control-button" onClick={toggleWebCamState}>
        {isWebCamOn ? <WebCamOnIcon /> : <WebCamOffIcon />}
      </button>
      <button className="control-button" onClick={toggleScreenShareState}>
        <ScreenShare fillColor={isScreenSharing ? "green" : "white"} />
      </button>
      <button className="control-button" onClick={onWhiteboardClick}>
        <WhiteboardIcon fillcolor="white" />
      </button>
      <button className="control-button" onClick={onMessageClick}>
        <Chat fillcolor="white"  />
      </button>
      <button className="control-button" onClick={handleCodeEditorClick}>
        <CodeEditorIcon fillColor="white" />
      </button>
    </div>
  );
};


const JoinScreen = ({ getMeetingAndToken }) => {
  const [meetingId, setMeetingId] = useState(null);
  const onClick = async () => {
    await getMeetingAndToken(meetingId);
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter Meeting Id"
        onChange={(e) => {
          setMeetingId(e.target.value);
        }}
      />
      <button  className="join-button"onClick={onClick}>Join</button>
      {/* {" or "} */}
      {/* <button onClick={onClick}>Create Meeting</button> */}
    </div>
  );
};

const [joined, setJoined] = useState(null);

const MeetingView = ({ meetingId, onMeetingLeave, onMeetingJoined }) => {
  const { join, participants } = useMeeting({
    onMeetingJoined: () => {
      onMeetingJoined();
    },
    onMeetingLeft: () => {
      onMeetingLeave();
    },
  });

  const [code, setCode] = useState("// Click on send for your code to be evaluated"); // Maintain code state here
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const joinMeeting = () => {
    join();
  };

  const [isCodeEditorActive, setIsCodeEditorActive] = useState(false);
  const [isWhiteboard, setIsWhiteboard] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [participantActive, setParticipantActive] = useState(true);

  const handleCodeEditorClick = () => {
    if (!isCodeEditorActive) {
      setIsCodeEditorActive(true);
      setIsWhiteboard(false); // Turn off the whiteboard if the code editor is being turned on
    } else {
      setIsCodeEditorActive(false);
    }
  };

  const handleWhiteboardClick = () => {
    if (!isWhiteboard) {
      setIsWhiteboard(true);
      setIsCodeEditorActive(false); // Turn off the code editor if the whiteboard is being turned on
    } else {
      setIsWhiteboard(false);
    }
  };

  const handleMessageClick = () => {
    if (!showMessages) {
      setShowMessages(true);
    } else {
      setShowMessages(false);
    }
  };

  // Check if both whiteboard and chat are active
  useEffect(() => {
    if ((isWhiteboard && showMessages) || (isCodeEditorActive && showMessages)) {
      setParticipantActive(false);
    } else {
      setParticipantActive(true);
    }
  }, [isWhiteboard, showMessages, isCodeEditorActive]);

  return (
    <div className={`meeting-container ${isCodeEditorActive || isWhiteboard ? 'code-editor-active' : ''}`}>
      <h2 className="welcome-message">WELCOME TO THE AI INTERVIEW!</h2>
      {joined && joined === "JOINED" ? (
        <div className="meeting-content">
          {(isCodeEditorActive || isWhiteboard || showMessages) ? (
  <div className="main-content content-active">
    {participantActive && (
      <div className={`participants ${showMessages ? 'shift-left' : ''}`}>
        {[...participants.keys()].map((participantId) => (
          <div className="participant-container" key={participantId}>
            <ParticipantView participantId={participantId} />
          </div>
        ))}
        <div className="participant-container ai-bot">
          <ParticipantView participantId="bot" isBot={true} className="ai-bot-participant" />
        </div>
      </div>
    )}
  </div>
) : (
  <div className="main-content content-inactive">
    <div className="participants">
      {[...participants.keys()].map((participantId) => (
        <div className="participant-container" key={participantId}>
          <ParticipantView participantId={participantId} />
        </div>
      ))}
    </div>
    <div className="participant-container ai-bot">
      <ParticipantView participantId="bot" isBot={true} className="ai-bot-participant" />
    </div>
  </div>
)}


          {isCodeEditorActive && <CodeEditorWindow code={code} onChange={handleCodeChange} />}
          {isWhiteboard && <WhiteboardView />}

          <Message showMessages={showMessages} />
        </div>
      ) : joined && joined === "JOINING" ? (
        <h3 className="joining-message">Joining the meeting...</h3>
      ) : (
        <button className="join-button" onClick={joinMeeting}>Join</button>
      )}
      {joined === "JOINED" && <Controls onCodeEditorClick={handleCodeEditorClick} onWhiteboardClick={handleWhiteboardClick} onMessageClick={handleMessageClick} />}
    </div>
  );
};


const ParticipantView = ({ participantId }) => {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((error) => console.error("micRef.current.play() failed", error));
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className={`participant-container ${participantId === 'bot' ? 'ai-bot-participant' : ''}`} key={participantId}>
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn ? (
        <ReactPlayer
          className="participant-video"
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          width="100%"
          height="100%"
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      ) : participantId === 'bot' ? (
        <img
        src="/AIinterviewerImage.jpeg"
          alt="AI Bot"
          className="participant-video"
          width="100%"
          height="100%"
        />
      ) : null}
    </div>
  );
};


const CodeEditorWindow = ({ onChange, code }) => {
  // Initialize state with a comment
  const [value, setValue] = useState(code || "// Click on send for your code to be submitted");

  const [language, setLanguage] = useState("cpp");
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(14);

  const handleEditorChange = (value) => {
    setValue(value);
    if (onChange) onChange(value);
  };

  const handleSendClick = async () => {
    try {
      if(socket.current){
      socket.current.emit('sendCode', {code: value, language: language});
      resetPingTimeout();
      console.log("Code sent successfully");
          }
    } catch (error) {
      console.error("Error sending code:", error);
    }
  };

  return (
    <div className="code-editor-window">
      <div className="editor-toolbar">
        <select
          className="toolbar-item"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <select
          className="toolbar-item"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="vs-dark">Dark</option>
          <option value="light">Light</option>
        </select>
        <select
          className="toolbar-item"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
        >
          <option value={12}>12</option>
          <option value={14}>14</option>
          <option value={16}>16</option>
          <option value={18}>18</option>
          <option value={20}>20</option>
        </select>
        <button className="toolbar-item send-button" onClick={handleSendClick}>
          Send
        </button>
      </div>
      <Editor
        height="90vh"
        width="100%"
        language={language}
        value={value}
        theme={theme}
        options={{
          fontSize,
        }}
        onChange={handleEditorChange}
      />
    </div>
  );

}

useEffect(() => {
    const initializeMeeting = async () => {
      const newMeetingId = await createMeeting();
      setMeetingId(newMeetingId);
    };
    initializeMeeting();
  }, []);

  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  const onMeetingJoined = () => {
    setJoined("JOINED");
  }

  if (!authToken || !meetingId) {
    return <div>Loading...</div>;
  }

  return authToken && meetingId ? (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "C.V. Raman",
        chatEnabled: true,
      }}
      token={authToken}
    >
      <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} onMeetingJoined={onMeetingJoined}/>
    </MeetingProvider>
  ) : (
    <JoinScreen getMeetingAndToken={getMeetingAndToken} />
  );
}
