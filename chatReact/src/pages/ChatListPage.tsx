import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

type ChatParams = {
  name: string;
};

interface Message {
  sender: string;
  content: string;
}

function ChatListPage() {
  const { name } = useParams<ChatParams>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState<string>(name || '');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    setUsername(name || '');
  }, [name]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    if (connection) {
      const message: Message = {
        sender: username || '',
        content: inputText,
      };

      try {
        await connection.invoke('AddMessage', message);
        setInputText('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLeave = async () => {
    if (connection && username) {
      try {
        await connection.invoke('DeleteUser', username);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7186/chatHub') // Replace with the actual URL of your SignalR hub
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection); // Set the connection in the state

    newConnection.start().then(() => {
      newConnection.invoke('GetAllUsersAsync').then((users: string[]) => {
        setOnlineUsers(users);
      });

      newConnection.invoke('GetMessageList').then((messageList: Message[]) => {
        setMessages(messageList);
      });
    });

    return () => {
      if (newConnection.state === 'Connected') {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.on('MessageAdded', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      connection.on('UserDeleted', (deletedUser: string) => {
        setOnlineUsers((prevUsers) => prevUsers.filter((user) => user !== deletedUser));
      });
    }
  }, [connection]);

  useEffect(() => {
    if (username && !onlineUsers.includes(username)) {
      setOnlineUsers((prevUsers) => [...prevUsers, username]);
    }
  }, [username, onlineUsers]);

  useEffect(() => {
    return () => {
      if (connection && username) {
        connection.invoke('DeleteUser', username).catch((error) => {
          console.error(error);
        });
      }
    };
  }, [connection, username]);

  return (
    <div>
      <Link to="/" style={{ position: 'absolute', top: 10, right: 10 }} onClick={handleLeave}>
        Ayrıl
      </Link>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, borderRight: '1px solid gray', paddingRight: '10px' }}>
          <h3>Online Kullanıcılar:</h3>
          {onlineUsers.map((user, index) => (
            <p key={index}>{user}</p>
          ))}
        </div>
        <div style={{ flex: 2, paddingLeft: '10px' }}>
          <h2>Chat Odası: {username || ''}</h2>
          <div>
            {messages.map((message, index) => (
              <div key={index}>
                <strong>{message.sender}:</strong> {message.content}
              </div>
            ))}
          </div>
          <div>
            <input type="text" value={inputText} onChange={handleInputChange} />
            <button onClick={handleSendMessage}>Gönder</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatListPage;
