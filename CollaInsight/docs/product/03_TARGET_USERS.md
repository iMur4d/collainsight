# Target Users

<objective>

Define every user persona interacting with the platform.

This document helps AI agents understand who the product is built for, what each user needs, and how the interface, workflows, permissions, and AI behaviors should adapt accordingly.

</objective>

---

<context>

The platform is designed for organizations, educational programs, innovation teams, and collaborative environments where knowledge is continuously generated through conversations.

Different users have different goals.

The platform should never assume that every user has the same permissions or workflow.

</context>

---

<roles>

## Team Member

### Description

A regular user who contributes ideas, questions, observations, research notes, and tasks.

### Goals

- Submit ideas quickly.
- Organize personal knowledge.
- Track previous submissions.
- Discover related ideas.
- Collaborate with teammates.

### Permissions

- Create knowledge.
- Edit personal knowledge.
- View personal dashboard.
- Join projects.
- Receive AI recommendations.

### Restrictions

- Cannot access other users' private knowledge.
- Cannot manage organization settings.

---

## Team Lead

### Description

Responsible for supervising a team or project.

### Goals

- Review team contributions.
- Monitor project progress.
- Identify repeated problems.
- Encourage collaboration.

### Permissions

- View project knowledge.
- View team dashboards.
- Approve or reject ideas.
- Generate AI summaries.

---

## Administrator

### Description

Responsible for managing the workspace.

### Goals

- Manage users.
- Configure workflows.
- Monitor platform activity.
- Review organizational knowledge.

### Permissions

- Full system administration.
- User management.
- Project management.
- AI configuration.
- Analytics.

---

## Executive / CEO

### Description

Consumes insights instead of raw conversations.

The CEO should never need to read hundreds of Telegram messages.

### Goals

- Review AI summaries.
- Discover important ideas.
- Monitor innovation.
- Identify collaboration opportunities.
- Support strategic decision making.

### Permissions

- Organization-wide dashboards.
- AI reports.
- Analytics.
- Trend monitoring.

</roles>

---

<design_implications>

The interface should adapt depending on the current user role.

Examples:

- Team Members should primarily see their own knowledge.

- Team Leads should focus on project-level information.

- Administrators should manage the platform.

- Executives should consume insights instead of operational details.

The product should prioritize simplicity for contributors and rich analytics for management.

</design_implications>

---

<permissions_model>

The platform follows Role-Based Access Control (RBAC).

Permissions must always be assigned through roles rather than hardcoded logic.

Future integrations should inherit the same permission model.

</permissions_model>

---

<constraints>

The system must never expose private knowledge across users unless explicitly shared.

AI recommendations must respect user permissions.

Dashboards should only display data that the current user is authorized to access.

</constraints>

---

<future_expansion>

Potential future roles include:

- Mentor
- Reviewer
- External Client
- Guest User
- AI Agent

The architecture should allow new roles to be introduced without redesigning the permission system.

</future_expansion>