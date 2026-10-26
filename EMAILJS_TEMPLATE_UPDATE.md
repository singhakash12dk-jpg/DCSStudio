# EmailJS Template Update Guide

## How to Update Your EmailJS Template

Follow these steps to show the sender's email and name in incoming emails:

### Step 1: Log in to EmailJS Dashboard
- Go to https://dashboard.emailjs.com
- Sign in with your account

### Step 2: Edit Template `template_slxtvgm`
- Click on **Email Templates** → find `template_slxtvgm`
- Click **Edit**

### Step 3: Set the recipient
Set the template's **To Email** field to:
```
{{to_email}}
```

The website supplies `dreamcatcherstudios19@gmail.com` as `to_email` for each enquiry.

### Step 4: Update Subject Line
Replace the current subject with:
```
Contact from {{from_name}} <{{from_email}}>
```

### Step 5: Update Email Body
Replace the current body HTML/text with this:

**HTML Version (Recommended):**
```html
<p>You have received a new contact message.</p>

<p><strong>From:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>

<hr/>

<p><strong>Message:</strong></p>
<p>{{message}}</p>

<hr/>

<p><small>Email sent via DreamCatcher Studio website</small></p>
```

**Plain Text Version (Alternative):**
```
You have received a new contact message.

From: {{from_name}}
Email: {{from_email}}

---

Message:
{{message}}

---

Email sent via DreamCatcher Studio website
```

### Step 6: Set Reply-To Header
- Scroll down to **Headers** section (if available)
- Add a new header:
  - **Key:** `Reply-To`
  - **Value:** `{{reply_to}}`
- OR in **Advanced Settings**, look for a **Reply-To** field and set it to `{{reply_to}}`

### Step 7: Save & Test
- Click **Save**
- Go back to your website and submit a test contact form
- Check your email — you should now see:
  - **Subject:** "Contact from John Doe <john@example.com>"
  - **Body:** Shows name, email, and message
  - **Reply-To:** Automatically set to the sender's email (replies will go to them)

## Result
✅ You receive emails with the sender's full details visible
✅ Clicking "Reply" will send to the visitor's email (not your account)
✅ Gmail will still show your account as "From" (security measure) but the sender info is clearly in the subject and body

## Variables Available in Template
The contact form sends these variables:
- `{{to_email}}` — Enquiry destination (`dreamcatcherstudios19@gmail.com`)
- `{{from_name}}` — Visitor's name
- `{{from_email}}` — Visitor's email
- `{{message}}` — Their message
- `{{reply_to}}` — Same as from_email (for Reply-To header)
