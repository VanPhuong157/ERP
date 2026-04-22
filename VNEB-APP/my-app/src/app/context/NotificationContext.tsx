"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";
import { useAppContext } from "../../app/page";

// 1. Định nghĩa kiểu dữ liệu cho Notification
interface NotificationItem {
  id: string;
  message: string;
  type: string;
  time: string;
  isRead: boolean;
  link?: string;
}

const baseUrl = 'http://103.176.179.125:5244';
const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]); // Sử dụng kiểu dữ liệu đã định nghĩa
  const { user } = useAppContext();

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

    // 2. Chỉ định kiểu NotificationItem cho tham số newNoti
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
      .then((data: NotificationItem[]) => setNotifications(data)) // Ép kiểu cho data trả về
      .catch(err => console.error("Fetch Error:", err));

    return () => { 
      connection.stop(); 
    };
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};