import React, { useState, useEffect, useRef } from "react";
import parse from "html-react-parser";
import socketIOClient from "socket.io-client";
import styled from "styled-components";
import DIlogo from "./DIlogo.png";
import titleLogo from "./titleLogo.png";
import restartIcon from "./restart.png";
import sendIcon from "./sendButton.png";
import enlargeIcon from "./enlargeIcon.png";
import shrinkIcon from "./shrinkIcon.png";
import { BsArrowLeft } from "react-icons/bs";
import "bootstrap/dist/css/bootstrap.min.css";

const placeholderSOCKET_SERVER_URL = "https://flowise-udvikling.onrender.com";
const placeholderAPI =
  "https://flowise-udvikling.onrender.com/api/v1/prediction/a3e86073-8eda-401d-90d1-7127fb707f99";

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0.32em 0.64em; // Spacing around each message
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: left;
  margin: 0.7em;
  margin-top: 1.6em;
  align-items: center;

  & > div {
    background-color: #333; /* Color of the dots */
    width: 0.35em;
    height: 0.35em;
    margin: 0 0.11em;
    border-radius: 50%;
    animation: fadeInOut 0.6s infinite;
  }

  & > div:nth-child(2) {
    animation-delay: 0.2s;
  }

  & > div:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
`;

const TitleBar = styled.div`
  background-color: ${(props) => props.themeColor || "#5083e3"};
  color: white; /* White text */
  padding: 0.64em; /* Some padding around the elements */
  display: flex;
  align-items: center;
  border-top-left-radius: 0.64em; /* Match the border radius of ChatWindow for the top corners */
  border-top-right-radius: 0.64em;
`;

const Logo = styled.img`
  height: 1.9em;
  width: ${(props) => (props.titleG ? "1.9em" : "auto")};
  margin-right: 0.64em;
`;

const Title = styled.h1`
  flex-grow: 1; /* Allows the title to take up the remaining space */
  margin: 0; /* Remove default margin */
  font-size: 1em; /* Adjust size as needed */
  color: white;
  font-family: "Sans-Serif", Trebuchet MS;
`;

const PoweredBy = styled.div`
  text-align: center;
  margin-bottom: 0.5em;
  font-size: 0.64em;

  a {
    color: ${(props) =>
      props.themeColor || "#007bff"}; // Adjust the color to fit your design
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const CloseButton = styled.div`
  position: absolute;
  color: white;
  top: 0em; /* Adjusts the distance from the top of the TitleBar */
  right: 0.1em; /* Adjusts the distance from the right of the TitleBar */
  cursor: pointer;
  font-size: 1.8em; /* Adjust if necessary */
  line-height: 1;
  padding: 0.3em; /* Gives space around the 'x' for easier clicking */
  &:hover {
    opacity: 0.7;
  }
`;

// THis styling is for Talk to human button

const TalkToHuman = styled.div`
  border: 2px solid black;
  position: relative;
  right: 100px;

  align-items: center;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  display: inline-flex;
  font-family: system-ui, -apple-system, system-ui, "Helvetica Neue", Helvetica,
    Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  justify-content: center;
  line-height: 1.25;
  margin: 0;
  height: 2rem;
  padding: calc(0.875rem - 1px) calc(1.5rem - 1px);
  position: relative;
  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: auto;
`;

const RestartButton = styled.img`
  position: absolute;
  top: 1em;
  right: 2.4em; // Adjust this so it doesn't overlap with the CloseButton
  cursor: pointer;
  width: 1.33em; // Set an appropriate size for the image
  height: 1.33em; // Maintain the aspect ratio
  &:hover {
    opacity: 0.7;
  }
`;

const EnlargeButton = styled.img`
  position: absolute;
  top: 1em;
  right: 4.2em; // Adjust this so it doesn't overlap with the CloseButton
  cursor: pointer;
  width: 1.33em; // Set an appropriate size for the image
  height: 1.33em; // Maintain the aspect ratio
  &:hover {
    opacity: 0.7;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.9em;
`;

const HeaderLogo = styled.img`
  height: 3.9em; // Adjust as necessary to avoid stretching
  padding: 0.64em;
`;

const HeaderTitle = styled.h2`
  color: #333; /* Dark text for the title */
  margin: 0em; /* Reset default margin */
  font-size: 1.1em;
  text-align: center;
`;

const HeaderSubtitle = styled.p`
  color: #666; /* Lighter text for the subtitle */
  margin: 0.064em; /* Reset default margin */
  font-size: 0.88em;
  text-align: center;
`;

const ChatWindow = styled.div`
  position: fixed;
  bottom: 0.5em;
  right: 0.5em;
  width: 97vw;
  height: 97vh;
  background-color: white;
  box-shadow: 0 0.3em 0.5em rgba(0, 0, 0, 0.1);
  border-radius: 0.8em;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessageLogo = styled.img`
  height: 1.3em; // Adjust to the size you need
  width: 1.3em; // Maintain aspect ratio
  margin-right: 0em; // Space between logo and text
  margin-top: 1em;
`;

const MessageContainer = styled.div`
  display: flex;
  align-items: flex-start; // Aligns the image and text at the top
  justify-content: ${({ $isUser }) => ($isUser ==="User" ? "flex-end" : "flex-start")};
  margin: 0.32em 0.64em; // Spacing around each message
`;

const Message = styled.div`
  white-space: pre-line; /* Honors new line characters in text */
  font-family: "Open Sans", sans-serif;
  font-weight: 400;
  padding: 0.6em 0.64em 0.64em 0.64em;
  margin: 0.45em;
  border-radius: 0.64em;
  background-color: ${({ $isUser, themeColor }) =>
    $isUser ? themeColor : "#e9ecef"};
  color: ${({ $isUser }) => ($isUser ==="Agent"? "black" : "white")};
  align-self: ${({ $isUser }) => ($isUser ==="User"? "flex-end" : "flex-start")};
  max-width: 75%;
  width: fit-content;
  word-break: break-word; // This will break long words to prevent overflow
  margin-left: ${({ $isUser }) =>
    $isUser ==="User" ? "auto" : "0.64em"}; /* Auto margin for user messages */
  margin-right: ${({ $isUser }) =>
    $isUser ==="User" ? "0.64em" : "auto"}; /* Auto margin for AI messages */
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0em;
  margin-bottom: 0em; // Ensure space for the send button
`;

const SendButton = styled.img`
  cursor: pointer;
  width: 1.3em;
  height: 1.3em;
  position: absolute;
  right: 1.15em; // You can adjust this based on your design needs
  bottom: 0.75em; // Adjust based on the size of ChatInput to vertically align it
`;

const ChatInput = styled.input`
  background-color: white;
  padding: 0.64em; /* Padding inside the input */
  padding-right: 3.2em; /* Padding inside the input */
  border: none; /* No border */
  border-radius: 0.64em; /* Rounded corners */
  margin: 1.2em; /* Margin from the edges of the ChatWindow */
  margin-bottom: 0.5em;
  width: calc(100% - 1.3em); /* Full width inside the ChatWindow with margin */
  box-sizing: border-box; /* Border and padding should be included in the width and height */
  outline: 0.064em solid #a9a9a9; /* Gray outline */
  outline-offset: 0.13em; /* Distance between outline and border */

  &:focus {
    outline: 0.064em solid #007bff; /* Blue outline on focus */
  }

  &::placeholder {
    color: #a9a9a9; /* Placeholder text color */
  }
`;

const App = () => {
  const [conversation, setConversation] = useState([
    { message: "Hej, hvad kan jeg hjælpe dig med?", type: "Agent" },
  ]);
  const [conversationHis, setConversationHis] = useState([
    {
      message: "Hej, hvad kan jeg hjælpe dig med?",
      type: "Agent",
    },
  ]);
  const [message, setMessage] = useState("");
  const [socketIOClientId, setSocketIOClientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const socket = useRef(null);

  const [apiEndpoint, setApiEndpoint] = useState("");
  const [titleLogoG, setTitleLogoG] = useState("");
  const [headerLogoG, setHeaderLogoG] = useState("");
  const [themeColor, setThemeColor] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [headerTitleG, setHeaderTitleG] = useState("");
  const [headerSubtitleG, setHeaderSubtitleG] = useState("");
  const [titleG, setTitleG] = useState("");
  const [SOCKET_SERVER_URL, setSocketServerUrl] = useState("");

  const [msgIndex, setMsgIndex] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFormSubmitted, setFormSubmited] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const[disabledTextField,setDisabledTextField]=useState(false)
  const [userId,setUserId]=useState("")
console.log("conversationHis",conversationHis)
  // chat
  const handleSubmit = async () => {
    setIsFormVisible(false);
    // setFormSubmited(true);
    let payload = {
      name: name,
      email: email,
    };

    try {
      const response = await fetch(
        `${`http://192.168.18.42:11000`}/lead/add-lead-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("server error");
      }

      const data = await response.json();
      setUserId(data?.details?.user_id)
      // localStorage.setItem("userDetails", data?.details?.user_id);
      setFormSubmited(true)
      setDisabledTextField(true)
      setIsFormVisible(false)
      resetChat();
      console.log("response", data);
      return data;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
    }
  };

  // send chat
  const sendMessage = async () => {
    // let userId = localStorage.getItem("userDetails")
    // console.log("userId", userId);
    let formData = new FormData()

    formData.append("message", message)
    formData.append("user_id", userId)
    formData.append("type", "user")
  
    console.log("formate",formData)
    // setMsgIndex(msgIndex + 1);
    // Start loading state
    setIsLoading(true);

    // Ensure the message is not empty
    if (!message.trim()) {
      console.error("Message is empty.");
      setIsLoading(false); // Stop loading state if there is an error
      return;
    }

    const tempHis = conversationHis;
    tempHis.splice(0, tempHis.length - 5);
    setConversationHis(tempHis);

    // Add the user message to the conversationHis
    setConversationHis((prevHis) => [
      ...prevHis,
      {
        message: message,
        type: "User",
      },
    ]);

    // Add the message to the conversation
    setConversation((prevConv) => [
      ...prevConv,
      { message: message, type: "User" },
    ]);

    setMessage(""); // Clear the input after sending
    if (!userId) {
      try {
        // Use the apiEndpoint from the state in your fetch call
        const response = await fetch(apiEndpoint || placeholderAPI, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer wEfLmtcJ4Mj2DODkFDWq2ggjjJ6gJ125sJJpfMR/Aeg=", // Ensure this is secure
          },
          body: JSON.stringify({
            question: message,
            history: conversationHis,
            socketIOClientId,
          }),
        });

        console.error(`History ${JSON.stringify(conversationHis)}`);

        if (response.ok) {
          const jsonResponse = await response.json();

          const apiResponseMessage = jsonResponse.text;
          // Add the API response message to the conversationHis
          setConversationHis((prevHis) => [
            ...prevHis,
            {
              message: apiResponseMessage,
              type: "Agent",
            },
          ]);
        } else {
          console.error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Sending message failed:", error);
      } finally {
        setIsLoading(false); // Stop loading state after the request
      }
    } else {
      try {
        console.log("form data",formData);
        const response = await fetch(
          `${`http://192.168.18.42:11000`}/chat/chat`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          console.log("error in response")
          // throw new Error("server error");
        }

        const data = await response.json();
       
        if(data){
          getAgentChats(userId)
        }
        if (data?.details){
          alert(data.details)
        }
        // alert(data.details)
        // setMessage(data?.details)
        return data;
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error;
      }
    }
  };


 
    // actions.js or api.js
    const getAgentChats = async (userId) => {
      try {
        const response = await fetch(
          `${`http://192.168.18.42:11000`}/lead/get-chat-by-user-id?user_id=${userId}`,
          {
            method: "GET",
            // headers: {
            //   "Content-Type": "application/json",
            // },
          }
        );
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        // console.log("response7979",response)
        const data = await response.json();
        if(data?.details && data?.details.length>0){
          setIsFormVisible(false)
          setFormSubmited(false)
          setDisabledTextField(false)
          resetChat();
          setConversation((prevHis) => 
            data?.details.map(msg => ({
              message: msg.Message,
              type: msg.type,
            })),
          );
          setIsLoading(false);
        }
        console.log("data000",data)
        // console.log("aaaaa",data);
        return data;
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error;
      }
    };
 
    useEffect(() => {
      if (userId) {
        let resp = getAgentChats(userId);
        console.log("Initial API call:", resp);
      }
      
      const intervalId = setInterval(() => {
        if (userId) {
          let resp = getAgentChats(userId);
          console.log("Interval API call:", resp);
        }
      }, 5000);
    
      return () => clearInterval(intervalId);
    }, [userId]);
    
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      // Handle the message based on the action
      if (event.data && event.data.action === "integrationOptions") {
        // Set your API endpoint state here
        setApiEndpoint(event.data.apiEndpoint);
        setTitleLogoG(event.data.titleLogoG);
        setHeaderLogoG(event.data.headerLogoG);
        setThemeColor(event.data.themeColor);
        setPagePath(event.data.pagePath);
        setHeaderTitleG(event.data.headerTitleG);
        setHeaderSubtitleG(event.data.headerSubtitleG);
        setTitleG(event.data.titleG);
        setSocketServerUrl(event.data.SOCKET_SERVER_URL);
      }
    };

    // Add the event listener
    window.addEventListener("message", handleMessage);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    socket.current = socketIOClient(
      SOCKET_SERVER_URL || placeholderSOCKET_SERVER_URL
    );

    socket.current.on("connect", () => {
      setSocketIOClientId(socket.current.id);
    });

    socket.current.on("start", () => {
      setConversation((prevConv) => [...prevConv, { message: "", type: "" }]);
    });

    socket.current.on("token", (token) => {
      setIsLoading(false);
      setConversation((prevConv) => {
        const newConv = [...prevConv];
        const lastMessageIndex = newConv.length - 1;
        newConv[lastMessageIndex] = {
          ...newConv[lastMessageIndex],
          message: newConv[lastMessageIndex].message + token,
        };
        return newConv;
      });
    });

    socket.current.on("end", () => {});

    return () => {
      socket.current.disconnect();
    };
  }, [SOCKET_SERVER_URL]);

 

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSize = () => {
    setIsEnlarged(!isEnlarged);
    window.parent.postMessage({ action: "toggleSize" }, pagePath); // Ensure the domain is correct for security
  };

  const resetChat = () => {
    // Optionally: Disconnect existing socket connection
    socket.current.disconnect();

    // Reset conversation
    setConversation([
      { message: "Hej, hvad kan jeg hjælpe dig med?", type: "Agent" },
    ]);
    setConversationHis([
      {
        message: "Hej, hvad kan jeg hjælpe dig med?",
        type: "Agent",
      },
    ]);

    // Reset other relevant states (e.g., message, isLoading)
    setMessage("");
    setIsLoading(false);

    // Optionally: Reconnect the socket connection if you've disconnected it
    socket.current.connect();
  };

  useEffect(scrollToBottom, [conversation]);

  function closeChat() {
    window.parent.postMessage({ action: "closeChat" }, pagePath); // Make sure this matches the actual parent domain
  }

  return (
    <>
      <ChatWindow>
        <TitleBar themeColor={themeColor}>
          <Logo src={titleLogoG || titleLogo} alt="Logo" titleG={titleG} />
          <Title>{titleG}</Title>
          <RestartButton
            src={restartIcon} // Replace with the actual path to your restart button image
            alt="Restart Chat"
            onClick={resetChat}
          />
          <CloseButton onClick={closeChat}>×</CloseButton>
          <EnlargeButton
            src={isEnlarged ? shrinkIcon : enlargeIcon}
            alt="Toggle Size"
            onClick={toggleSize}
          />

          <TalkToHuman onClick={toggleFormVisibility}>
            Talk to Human
          </TalkToHuman>
        </TitleBar>
        <div style={{ flexGrow: 1, overflow: "auto" }}>
          <Header>
            <HeaderLogo src={headerLogoG || DIlogo} alt="Logo" />
            <HeaderTitle>{headerTitleG || "Dialog Intelligens AI"}</HeaderTitle>
            <HeaderSubtitle>
              {headerSubtitleG ||
                "Vores virtuelle assistent er her for at hjælpe dig."}
            </HeaderSubtitle>
          </Header>
          {conversation.map((entry, index) => {
            const formattedText = entry?.message !==null && entry?.message
              // Convert line breaks followed by "- " to bullet points
              .replace(/\n- /g, "\n\u2022 ")
              // Convert text surrounded by "**" to bold
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            return (
              <>
                <MessageContainer key={index} $isUser={entry?.type}>
                  {!entry?.type && (
                    <MessageLogo src={headerLogoG || DIlogo} alt="AI Logo" />
                  )}
                  <Message
                  style={{ backgroundColor: entry.type === "Agent" ? "#dce3de" : "#5083e3" }}
                    $isUser={entry?.type}
                    // themeColor={entry.type==="Agent" ?"#0000": "#5083e3"}
                  >
                    <div>{parse(formattedText)}</div>
                  </Message>
                </MessageContainer>
              </>
            );
          })}
          <InputContainer>
            {/* When user click on Talk to human than this form will open. */}
            {isFormVisible && (
              <div
                style={{
                  position: "relative",
                  backgroundColor: "#e9ecef",
                  borderRadius: "10px",
                  padding: "20px",
                  width: "300px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  marginBottom: "30px",
                  marginTop: "30px",
                  marginLeft: "30px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "20px",
                    width: "0",
                    height: "0",
                    borderBottom: "20px solid #e9ecef",
                    borderLeft: "20px solid transparent",
                    borderRight: "20px solid transparent",
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "20px",
                    cursor: "pointer",
                  }}
                >
                  <BsArrowLeft
                    onClick={toggleFormVisibility}
                    size={20}
                    color="#007bff"
                    style={{ position: "relative", top: "20px" }}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      marginBottom: "15px",
                      width: "100%",
                      paddingTop: "20px",
                    }}
                  >
                    <label
                      htmlFor="name"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "5px",
                        display: "block",
                      }}
                    >
                      Name:
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #888",
                        width: "100%",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "15px", width: "100%" }}>
                    <label
                      htmlFor="email"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "5px",
                        display: "block",
                      }}
                    >
                      Email:
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #888",
                        width: "100%",
                      }}
                    />
                  </div>
                  <button
                    // onClick={handleSubmit}
                    type="submit"
                    style={{
                      backgroundColor: "#4287f5",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "10px 20px",
                      cursor: "pointer",
                    }}
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}
          </InputContainer>
          {isLoading && (
            <TypingIndicator>
              <MessageLogo src={headerLogoG || DIlogo} alt="AI Logo" />
              <LoadingIndicator>
                <div></div>
                <div></div>
                <div></div>
              </LoadingIndicator>
            </TypingIndicator>
          )} 
          <div ref={messagesEndRef} />{" "}
           {/* Invisible element to scroll into view */}
        </div>
        {isFormSubmitted && (
          <div className="d-flex flex-row justify-content-center align-items-center">
            <p className="mt-4">Please wait for an agent to connect</p>
            <LoadingIndicator>
              <div></div>
              <div></div>
              <div></div>
            </LoadingIndicator>
          </div>
        )}
        <InputContainer>
          <ChatInput
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Skriv dit spørgsmål her..."
            disabled={disabledTextField}
          />
          {message && (
            <SendButton src={sendIcon} alt="Send" onClick={sendMessage} />
          )}
        </InputContainer>
        <PoweredBy themeColor={themeColor}>
          Powered by{" "}
          <a
            href="https://dialogintelligens.dk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dialog Intelligens
          </a>
        </PoweredBy>
      </ChatWindow>
    </>
  );
};

export default App;
