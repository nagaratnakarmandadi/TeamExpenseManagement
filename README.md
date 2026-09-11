# Team Expense Management API

A **Spring Boot REST API** for managing team events, members, and expenses.

This application allows users to create events, add/remove members from events, and manage expenses associated with those events.

---

## 🚀 Features

* Create and view events
* Get event details by ID
* Add members to an event
* Remove members from an event
* Create expenses
* View all expenses
* View expense details by ID
* Get expenses for a specific event
* Update expenses
* Delete expenses
* Request validation using Jakarta Validation
* RESTful API architecture
* Proper HTTP status codes using `ResponseEntity`

---

## 🏗️ Project Architecture

The application follows a layered architecture:

```text
Client
  |
  v
Controller Layer
  |
  v
Service Layer
  |
  v
Repository Layer
  |
  v
Database
```

### Layers

| Layer      | Responsibility                                        |
| ---------- | ----------------------------------------------------- |
| Controller | Handles HTTP requests and responses                   |
| Service    | Contains business logic                               |
| Repository | Communicates with the database                        |
| Entity     | Represents database tables                            |
| DTO        | Transfers request data between client and application |

---

## 📁 Project Structure

```text
src
└── main
    └── java
        └── com.example.teamexpense
            ├── controller
            │   ├── EventController.java
            │   └── ExpenseController.java
            │
            ├── dto
            │   ├── EventRequest.java
            │   └── ExpenseRequest.java
            │
            ├── entity
            │   ├── Event.java
            │   └── Expense.java
            │
            ├── service
            │   ├── EventService.java
            │   └── ExpenseService.java
            │
            └── repository
                ├── EventRepository.java
                └── ExpenseRepository.java
```

---

# 🔗 API Endpoints

## 1. Event APIs

Base URL:

```text
/api/events
```

### Create Event

**POST**

```text
/api/events
```

### Request

```json
{
  "name": "Goa Trip",
  "description": "Team vacation",
  "date": "2026-10-15"
}
```

### Response

**HTTP 201 Created**

```json
{
  "id": 1,
  "name": "Goa Trip",
  "description": "Team vacation",
  "date": "2026-10-15"
}
```

---

### Get All Events

**GET**

```text
/api/events
```

### Response

**HTTP 200 OK**

```json
[
  {
    "id": 1,
    "name": "Goa Trip",
    "description": "Team vacation",
    "date": "2026-10-15"
  }
]
```

---

### Get Event By ID

**GET**

```text
/api/events/{id}
```

### Example

```text
/api/events/1
```

### Response

**HTTP 200 OK**

```json
{
  "id": 1,
  "name": "Goa Trip",
  "description": "Team vacation",
  "date": "2026-10-15"
}
```

---

### Add Member to Event

**POST**

```text
/api/events/{eventId}/members/{userId}
```

### Example

```text
/api/events/1/members/5
```

This adds user `5` to event `1`.

### Response

**HTTP 200 OK**

```json
{
  "id": 1,
  "name": "Goa Trip",
  "members": [
    {
      "id": 5
    }
  ]
}
```

---

### Remove Member from Event

**DELETE**

```text
/api/events/{eventId}/members/{userId}
```

### Example

```text
/api/events/1/members/5
```

This removes user `5` from event `1`.

---

# 💰 2. Expense APIs

Base URL:

```text
/api/expenses
```

---

### Create Expense

**POST**

```text
/api/expenses
```

### Request

```json
{
  "eventId": 1,
  "description": "Hotel",
  "amount": 5000,
  "paidBy": 5
}
```

### Response

**HTTP 201 Created**

```json
{
  "id": 1,
  "description": "Hotel",
  "amount": 5000
}
```

---

### Get All Expenses

**GET**

```text
/api/expenses
```

### Response

**HTTP 200 OK**

```json
[
  {
    "id": 1,
    "description": "Hotel",
    "amount": 5000
  },
  {
    "id": 2,
    "description": "Food",
    "amount": 2500
  }
]
```

---

### Get Expense By ID

**GET**

```text
/api/expenses/{id}
```

### Example

```text
/api/expenses/1
```

---

### Get Expenses By Event

**GET**

```text
/api/expenses/event/{eventId}
```

### Example

```text
/api/expenses/event/1
```

This returns all expenses belonging to event `1`.

---

### Update Expense

**PUT**

```text
/api/expenses/{id}
```

### Example

```text
/api/expenses/1
```

### Request

```json
{
  "eventId": 1,
  "description": "Hotel Updated",
  "amount": 5500,
  "paidBy": 5
}
```

### Response

**HTTP 200 OK**

Returns the updated expense.

---

### Delete Expense

**DELETE**

```text
/api/expenses/{id}
```

### Example

```text
/api/expenses/1
```

### Response

**HTTP 204 No Content**

The expense is successfully deleted.

---

# 📊 API Summary

| Method | Endpoint                                 | Description           |
| ------ | ---------------------------------------- | --------------------- |
| POST   | `/api/events`                            | Create event          |
| GET    | `/api/events`                            | Get all events        |
| GET    | `/api/events/{id}`                       | Get event by ID       |
| POST   | `/api/events/{eventId}/members/{userId}` | Add member            |
| DELETE | `/api/events/{eventId}/members/{userId}` | Remove member         |
| POST   | `/api/expenses`                          | Create expense        |
| GET    | `/api/expenses`                          | Get all expenses      |
| GET    | `/api/expenses/{id}`                     | Get expense by ID     |
| GET    | `/api/expenses/event/{eventId}`          | Get expenses by event |
| PUT    | `/api/expenses/{id}`                     | Update expense        |
| DELETE | `/api/expenses/{id}`                     | Delete expense        |

---

# 🛠️ Technologies Used

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Jakarta Validation
* MySQL
* Maven
* REST API
* JSON
* Postman

---

# 📦 Maven Dependencies

The project requires dependencies for:

```text
Spring Web
Spring Data JPA
MySQL Driver
Validation
Lombok
Spring Boot DevTools
```

Example:

```xml
<dependencies>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

</dependencies>
```

---

# ⚙️ Configuration

Configure the database in:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/teamexpense
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

> Replace the database name, username, and password according to your local environment.

---

# ▶️ How to Run

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
```

### 2. Open the Project

Open the project in:

* IntelliJ IDEA
* Eclipse
* Spring Tool Suite
* VS Code

### 3. Configure MySQL

Create the database:

```sql
CREATE DATABASE teamexpense;
```

Update the database credentials in:

```text
application.properties
```

### 4. Build the Project

```bash
mvn clean install
```

### 5. Run the Application

```bash
mvn spring-boot:run
```

Or run the main Spring Boot application class directly from the IDE.

---

# 🧪 Testing APIs

You can test the APIs using:

* Postman
* Swagger/OpenAPI
* cURL
* Browser for GET requests

Example:

```text
GET http://localhost:8080/api/events
```

```text
GET http://localhost:8080/api/expenses
```

---

# 🔄 Application Flow

### Event Creation

```text
Client
   |
   | POST /api/events
   v
EventController
   |
   v
EventService
   |
   v
EventRepository
   |
   v
MySQL Database
```

### Expense Creation

```text
Client
   |
   | POST /api/expenses
   v
ExpenseController
   |
   v
ExpenseService
   |
   v
ExpenseRepository
   |
   v
MySQL Database
```

---

# 🔐 Validation

The application uses:

```java
@Valid
```

to validate incoming request data.

Example:

```java
@PostMapping
public ResponseEntity<Expense> createExpense(
        @Valid @RequestBody ExpenseRequest request) {

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(expenseService.createExpense(request));
}
```

If the request contains invalid data, Spring's validation mechanism can reject the request before it reaches the service layer.

---

# 📌 HTTP Status Codes

The application uses appropriate HTTP status codes:

| Status                    | Meaning                           |
| ------------------------- | --------------------------------- |
| 200 OK                    | Request successfully processed    |
| 201 Created               | New resource successfully created |
| 204 No Content            | Resource successfully deleted     |
| 400 Bad Request           | Invalid request data              |
| 404 Not Found             | Resource not found                |
| 500 Internal Server Error | Unexpected server error           |

---

# 🎯 Business Use Case

The application can be used for managing expenses for:

* Team outings
* Office trips
* Group vacations
* Project events
* Team lunches
* Sports events
* Group celebrations

### Example

A team plans a **Goa Trip**.

```text
Goa Trip
   |
   +-- Members
   |     +-- User 1
   |     +-- User 2
   |     +-- User 3
   |
   +-- Expenses
         +-- Hotel       ₹5,000
         +-- Food        ₹2,500
         +-- Transport   ₹3,000
```

The application maintains the event, members, and expenses through REST APIs.

---

# 👨‍💻 Future Enhancements

Possible future improvements:

* User registration and login
* Spring Security
* JWT authentication
* Role-based authorization
* Expense splitting
* Automatic settlement calculation
* Who-owes-whom calculation
* Email notifications
* Pagination and sorting
* Global exception handling
* Swagger/OpenAPI documentation
* Spring Boot Actuator
* Docker support
* React/Angular frontend

---

# 📚 Learning Concepts Covered

This project demonstrates important Spring Boot concepts:

```text
Spring Boot
     ↓
REST Controllers
     ↓
DTOs
     ↓
Validation
     ↓
Service Layer
     ↓
Spring Data JPA
     ↓
Hibernate
     ↓
MySQL
     ↓
REST API Testing
```

It is a good project for understanding how a **real-world Spring Boot CRUD + relationship-based REST application** is structured.

---

## 👨‍💻 Author

**Srikanth**

Java Full Stack Developer / Trainer

Technologies:

```text
Java | Spring Boot | REST API | Spring Data JPA
Hibernate | MySQL | Microservices
```

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
