Task Manager 


A productivity app for managing tasks visually.


Core features:


* Create boards, lists, and cards
* Drag-and-drop tasks 
* Assign users to tasks
* Real-time updates 
* Comments or activity logs
* Remainder alarm \[Notification]



You need to be able add tasks. You need to be able to assign required time, deadline, priority to a task. The could be showed as in board \& card. The can also be shown in list view sorted in accordance with the deadline.



The colour of the the cards will change to as we approach deadline. It will be green after we complete it.

# Assignment Explanation

## Task Card Details
Each task card should contain the following information:
* **Name:** Title of the task
* **Owner:** The creator or owner of the task
* **Start Date:** Automatically generated (e.g., using React Native's time module)
* **Deadline:** The due date for the task
* **Priority:** Priority level (e.g., High, Medium, Low)
* **Members:** Assigned members
* **Description:** Details about the task
* **Status / Color Coding:** 
  * Completed: Yes or No
  * If Yes: Card turns Green
  * If No: Card turns Red as the remaining time approaches the deadline
  * eq : Rg = 255 Rr = 0  i = initial time time = current time 
  * Rg = 255 - 255/time * i  
  * Rr= 0 + 255/time * i  

## Additional Features
* **Drag and Drop:** Users can drag and drop cards to change their status or list.
* **Activity Log:** Maintain a log (e.g., in a text file or database) capturing events such as:
  * `[owner] added [task_name] at [time]`
  * `[owner] updated [task_name] at [time]`
  * `[owner] deleted [task_name] at [time]`
* **Notifications:** Real-time alarm or push notifications triggered when a specific deadline or time is reached.


