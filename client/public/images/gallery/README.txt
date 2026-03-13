DROP YOUR GATHERING/EVENT PHOTOS IN THIS FOLDER
then update manifest.json to register them.

--- HOW TO ADD PHOTOS ---

1. Copy your photo files into this folder (JPG or WebP recommended).
   Name them something descriptive, e.g.:
     meeting-jan.jpg
     lab-session-02.jpg
     group-photo.jpg

2. Open manifest.json (same folder) and add each photo to the "photos" array:

   {
     "title": "Behind the Build",
     "subtitle": "The Cyber Cougars team putting in the work.",
     "photos": [
       {
         "file": "group-photo.jpg",
         "caption": "Full team at the kick-off meeting",
         "tags": ["darien", "jazmine", "cody"]
       },
       {
         "file": "lab-session-02.jpg",
         "caption": "Working through the VLAN lab",
         "tags": ["cody", "richard"]
       }
     ]
   }

3. Save manifest.json. The gallery on the home page updates automatically (no code changes needed).
   Tagged members will also see the photo appear in the Photos section of their profile page.

--- TAGS ---
- "tags" is optional — leave it out or use [] if no one needs to be tagged.
- Tags are member profile slugs (lowercase name, hyphens for spaces).
  Example slugs: "darien", "josh", "jazmine", "cody", "richard", "mason", "jeremy"
- To find a member's exact slug: view their profile in the app and check the URL or
  look at the profileSlug field in MongoDB.
- A photo can tag multiple members: "tags": ["darien", "cody", "jazmine"]

--- TIPS ---
- Captions are optional — leave them out and the overlay just won't appear.
- Photos are lazy-loaded, so adding lots of them is fine.
- Clicking any photo opens a full-size lightbox with prev/next arrows.
- Recommended size: 1200x900 px or similar 4:3 ratio. JPG quality 80 is fine.
