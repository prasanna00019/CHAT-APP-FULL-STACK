
# Chat App using socket-IO & MERN stack

A feature-rich, full-stack chat application using **MERN** stack offering seamless one-to-one and group chat functionalities, along with an engaging Stories feature. Designed to provide a **WhatsApp**-like experience, the app includes:

- **Core Messaging Features**:  
  - Message deletion options: **_Delete for Me_** and **_Delete for Everyone_**. Users can also **UNDO** these operations for both the delete methods.  
  - Delivery (**single and double tick indicators**), Message Info (**read and delivered time**)  in **realtime** over sockets.
  - **Message reactions**, **replies**, **pinning**, **starring**, and **editing**.  
  - Support for rich **media** types including `.mp4`, `.mp3`, `.pdf`, and images.  
  - **Forwarding messages**, **searching messages**, and tracking **unread message counts**.  
  - **Read Receipts** for users privacy like in WhatsApp

- **Advanced Functionalities**:  
  - **Scheduled Messaging**: Schedule messages to be sent at a later time.  
  - **AI Summarizer**: Automatically generate concise summaries for lengthy messages.  
  - **Trending Messages in Groups**: Highlight popular messages within group chats. This feature was inspired by Twitter/X
  - **Undo Delete Options**: Restore deleted messages for both "for me" and "for everyone" scenarios.  
  - **Search Messages:** Leveraged **MongoDB Atlas** search to efficiently search messages in a chat 

- **Real-Time Updates**:  
  - Leveraged **Socket.IO** for real-time synchronization of all app features.  

- **Group & Story Features**:  
  - Group creation and management with admin privileges(make others admin, dismiss admins, add/remove members).  
  - Broadcast Stories to targeted group audiences. Reply
    to stories   

- **Additional Features**:  
  - Online and last seen status for users.  
  - End-to-end encryption ensuring secure conversations using 
    Crypto - JS  
    

## Chat App Images
> ## Home page 
![Logo](https://github.com/prasanna00019/CHAT-APP-FULL-STACK/blob/main/frontend/src/assets/Screenshot%202024-11-24%20193155.png)

> ## One to One chats 
![Logo](https://github.com/prasanna00019/CHAT-APP-FULL-STACK/blob/main/frontend/src/assets/Screenshot%202024-11-24%20193254.png)

> ## Trending Feature in Your Groups 
![Logo](https://github.com/prasanna00019/CHAT-APP-FULL-STACK/blob/main/frontend/src/assets/trending-groups.jpg)

[UNDO DELETE FOR ME , DELETE FOR EVERYONE VIDEO](https://firebasestorage.googleapis.com/v0/b/code-execution-engine.appspot.com/o/delete-undo.mp4?alt=media&token=f9c69c09-a996-4c5b-9d24-a123cdb25a6f)




## Here is a PPT link attached below describing the App in depth with few videos  
**Here I have described in detail the working of functionalities of the chat App  with videos attached in it . You can have a look into it.**

[CHAT APP PPT ](https://iitram-my.sharepoint.com/:p:/g/personal/halakarnimath_prasanna_22co_iitram_ac_in/EWHhwkTi82lHmiuic0lCvmsBfuuOKnsTi4xfhKN3miOreA?rtime=42UJDK8S3Ug)

