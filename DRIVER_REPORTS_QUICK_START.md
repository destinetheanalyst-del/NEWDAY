# Driver Reports - Quick Start Guide 🚀

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DRIVER HOME PAGE                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │          📦 Welcome, Driver!                        │    │
│  │                                                      │    │
│  │    ┌──────────────────────────────────────┐        │    │
│  │    │  📦  Register Parcel                 │        │    │
│  │    └──────────────────────────────────────┘        │    │
│  │    ┌──────────────────────────────────────┐        │    │
│  │    │  📄  View My Reports          ◄──────┼────────┼─── Click Here!
│  │    └──────────────────────────────────────┘        │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DRIVER REPORTS PAGE                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📄 My Parcel Reports        [ Export All QR Codes ] │  │
│  │     12 parcels registered                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔍 Search by reference number, sender, receiver...  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┬──────────┬──────────┐                        │
│  │ Registered│ Verified │ Delivered│                        │
│  │     8     │    3     │    1     │                        │
│  └──────────┴──────────┴──────────┘                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ┌────────┐   GTS-20260212-1003  [VERIFIED]  📋 🖨│   │
│  │  │  QR    │   📅 Feb 12, 2026                      │   │
│  │  │  CODE  │   Sender: John → Receiver: Jane        │   │
│  │  │        │   Items: Laptop, Phone, Tablet         │   │
│  │  └────────┘   Total: ₦850,000 | 5.5 Kg | 0.02 m³  │   │
│  │  [Download]                                         │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ┌────────┐   GTS-20260211-1002  [REGISTERED] 📋 🖨│   │
│  │  │  QR    │   📅 Feb 11, 2026                      │   │
│  │  │  CODE  │   Sender: Mary → Receiver: Tom         │   │
│  │  └────────┘   Items: Furniture                     │   │
│  │  [Download]   Total: ₦120,000 | 15 Kg | 0.20 m³   │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Features at a Glance

### 🔍 **Search Functionality**
Type to search across:
- Reference numbers
- Sender names
- Receiver names
- Item names

### 📊 **Statistics Dashboard**
See quick counts of:
- Registered parcels
- Verified parcels
- Delivered parcels

### 📱 **QR Codes**
Each parcel has:
- Large scannable QR code (140x140px)
- Embedded complete parcel data
- Download button for PNG export

### 🛠️ **Actions Per Parcel**

| Icon | Action | Description |
|------|--------|-------------|
| 📋 | Copy | Copy reference number to clipboard |
| 🖨️ | Print | Print formatted parcel report |
| 💾 | Download | Download QR code as PNG image |

### 📦 **Bulk Actions**
- **Export All QR Codes** - Download all QR codes at once

---

## Quick Actions

### 1️⃣ Find a Specific Parcel
```
1. Click "View My Reports"
2. Type in search box: "GTS-20260212-1003"
3. Press Enter
4. Parcel appears instantly
```

### 2️⃣ Download QR Code
```
1. Find parcel in list
2. Click "Download QR" button
3. QR code saves as PNG
4. Filename: QR_GTS-20260212-1003.png
```

### 3️⃣ Copy Reference Number
```
1. Find parcel in list
2. Click copy icon (📋)
3. Reference copied to clipboard
4. Toast notification confirms
```

### 4️⃣ Print Parcel Report
```
1. Find parcel in list
2. Click printer icon (🖨️)
3. Print dialog opens
4. Print or save as PDF
```

### 5️⃣ Export All QR Codes
```
1. Click "Export All QR Codes" button
2. All QR codes download
3. Each saved with unique filename
4. Ready for batch printing
```

---

## Parcel Card Breakdown

```
┌──────────────────────────────────────────────────────────┐
│  ┌─────────────┐                                          │
│  │             │  GTS-20260212-1003  [VERIFIED]    📋 🖨 │
│  │   QR CODE   │  📅 February 12, 2026, 10:30 AM         │
│  │  140x140px  │  ──────────────────────────────────────  │
│  │             │  Sender: John Doe                        │
│  │  Scannable  │  Contact: 0801234567                     │
│  │             │                                          │
│  └─────────────┘  Receiver: Jane Smith                   │
│   [Download QR]   Contact: 0817654321                    │
│                   ──────────────────────────────────────  │
│                   Items (3): [Laptop] [Phone] [Tablet]   │
│                   ──────────────────────────────────────  │
│                   ┌─────────┬──────────┬────────────┐    │
│                   │  Value  │  Weight  │  Volume    │    │
│                   │ ₦850K   │  5.5 Kg  │  0.02 m³   │    │
│                   └─────────┴──────────┴────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Status Badge Guide

### 🔵 **REGISTERED** (Blue)
- Parcel just created
- Awaiting official verification
- Driver can still track

### 🟢 **VERIFIED** (Green)
- Official has verified parcel
- Documentation complete
- Ready for transit

### 🟣 **DELIVERED** (Purple)
- Parcel delivered to receiver
- Transaction complete
- Archived for records

---

## Search Examples

### Search by Reference Number
```
Search: "GTS-20260212-1003"
Result: Exact match found ✓
```

### Search by Sender Name
```
Search: "John"
Result: All parcels from John Doe ✓
```

### Search by Item Name
```
Search: "laptop"
Result: All parcels containing laptops ✓
```

### Partial Search
```
Search: "GTS-202602"
Result: All parcels from February 2026 ✓
```

---

## Print Output Example

When you click print (🖨️), you get:

```
═══════════════════════════════════════
  NEWDAY GOODS TRACKING SYSTEM
        PARCEL REPORT
═══════════════════════════════════════

Reference Number: GTS-20260212-1003
Status: VERIFIED
Date: February 12, 2026, 10:30 AM

───────────────────────────────────────
SENDER INFORMATION
───────────────────────────────────────
Name:     John Doe
Contact:  0801234567
Address:  123 Main Street, Lagos

───────────────────────────────────────
RECEIVER INFORMATION
───────────────────────────────────────
Name:     Jane Smith
Contact:  0817654321
Address:  456 High Street, Abuja

───────────────────────────────────────
ITEMS
───────────────────────────────────────
┌────────┬────────────┬─────────┬─────────┬─────────┐
│ Name   │ Category   │ Weight  │ Value   │ Volume  │
├────────┼────────────┼─────────┼─────────┼─────────┤
│ Laptop │ Electronics│ 2.5 Kg  │ ₦450000 │ 0.01 m³ │
│ Phone  │ Electronics│ 0.5 Kg  │ ₦250000 │ 0.002m³ │
│ Tablet │ Electronics│ 2.5 Kg  │ ₦150000 │ 0.01 m³ │
└────────┴────────────┴─────────┴─────────┴─────────┘

═══════════════════════════════════════
```

---

## Keyboard Tips

| Key | Action |
|-----|--------|
| Type in search box | Start filtering |
| Click parcel card | See full details |
| Click action icons | Copy/Print/Download |
| Scroll | View more parcels |

---

## Mobile Experience

On mobile devices:
- ✅ QR codes stack above details
- ✅ Touch-friendly buttons
- ✅ Swipe to scroll
- ✅ Single-column layout
- ✅ All features accessible

---

## Tips & Tricks

### 💡 Pro Tip 1: Quick Copy
Double-click the reference number area to quickly copy it!

### 💡 Pro Tip 2: Batch Download
Use "Export All QR Codes" at the end of the day for daily backup.

### 💡 Pro Tip 3: Print to PDF
Instead of printing, save as PDF for digital records.

### 💡 Pro Tip 4: Search Smart
Use partial search terms like "202602" to find all February parcels.

### 💡 Pro Tip 5: Status Overview
Check the statistics cards for quick status overview.

---

## Common Questions

**Q: How do I find yesterday's parcels?**  
A: Parcels are sorted by date (newest first). Scroll down or search by date.

**Q: Can I delete a parcel?**  
A: No, parcels are permanent records for accountability.

**Q: What if I close the page?**  
A: All data is saved. Just click "View My Reports" again.

**Q: Can I scan the downloaded QR codes?**  
A: Yes! They work exactly like the on-screen ones.

**Q: How many parcels can I have?**  
A: Unlimited! All stored in browser localStorage.

---

## Getting Started

### First Time Using Reports?

1. **Register a Parcel**
   - Go to Driver Home
   - Click "Register Parcel"
   - Complete registration

2. **View Your Reports**
   - Return to Driver Home
   - Click "View My Reports"
   - See your first parcel!

3. **Try the Features**
   - Search for your parcel
   - Download the QR code
   - Try printing
   - Copy the reference number

4. **Explore**
   - Check the statistics
   - Try different searches
   - Export QR codes

---

## Support

Need help?
- Check the [full documentation](./DRIVER_REPORTS_FEATURE.md)
- Look for toast notifications (hints appear on actions)
- All buttons have hover tooltips

---

## Summary

The **Driver Reports Page** gives you:

✅ **Complete History** - All your parcels in one place  
✅ **Powerful Search** - Find anything instantly  
✅ **Easy Export** - Download QR codes anytime  
✅ **Professional Prints** - Formatted reports ready  
✅ **Status Tracking** - Monitor all parcels  

**Everything you need to manage your deliveries efficiently!**

---

**Happy Tracking! 🚚📦**
