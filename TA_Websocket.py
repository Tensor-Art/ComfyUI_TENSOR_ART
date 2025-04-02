# import websocket
# import uuid
#
# server_address = ""
# client_id = str(uuid.uuid4())
# apiKey = ""
# ws = websocket.WebSocket()
#
# headers = [
#     f"X-Device-Id: {client_id}",
#     f"Authorization: Bearer {apiKey}"
# ]
#
# try:
#     # 连接到 WebSocket 服务器
#     ws.connect(server_address, header=headers)
#     print("Connected successfully!")
#
#     # 发送消息
#     ws.send_text("{\"namespace\": \"ping\"}")
#     print("Message sent.")
#
#     # 接收消息
#     response = ws.recv()
#     print(f"Received: {response}")
#
# except websocket.WebSocketBadStatusException as e:
#     print(f"Connection failed: {e}")
# except Exception as e:
#     print(f"An error occurred: {e}")
# finally:
#     # 关闭连接
#     ws.close()
#     print("Connection closed.")