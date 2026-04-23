"use client";
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";
import { useAppContext } from "./AppProvider";

interface NotificationItem {
  id: string;
  content: string; // Đổi 'message' thành 'content' cho khớp với API
  type: string;
  createdAt: string; // Đổi 'time' thành 'createdAt' cho khớp với API
  isRead: boolean;
  link?: string;
}

const baseUrl = 'http://103.176.179.125:5244';
//const baseUrl = 'http://localhost:5244';

const NotificationContext = createContext<any>(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user } = useAppContext();

const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${baseUrl}/api/Notifications/read/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Cập nhật state cục bộ để UI thay đổi ngay lập tức
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("MarkAsRead Error:", err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("accessToken");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/notificationHub`, {
        accessTokenFactory: () => token || "" 
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        await connection.invoke("JoinGroup", user.id);
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
      }
    };

    startConnection();

    connection.on("ReceiveNotification", (newNoti: NotificationItem) => {
      setNotifications(prev => [newNoti, ...prev]);
    });

    fetch(`${baseUrl}/api/Notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then((data: NotificationItem[]) => setNotifications(data))
      .catch(err => console.error("Fetch Error:", err));

    return () => { 
      connection.stop(); 
    };
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};