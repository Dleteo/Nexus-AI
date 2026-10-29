type ContactIconName = "github" | "email" | "instagram" | "linkedin";

/** Decorative icons accompany visible, accessible link labels. */
export default function ContactIcon({name}:{name:ContactIconName}){
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name==="email"&&<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>}
    {name==="instagram"&&<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>}
    {name==="linkedin"&&<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7.5 10v7M11 17v-7m0 3c0-4 6-4 6 0v4"/><circle cx="7.5" cy="7" r=".8" fill="currentColor" stroke="none"/></>}
    {name==="github"&&<path d="M9 21v-3.5c-3.5 1-4-1.5-5-2m11 5.5v-4c0-1 .1-1.5-.5-2 3.2-.4 6.5-1.6 6.5-7a5.5 5.5 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.7S18 .1 15 2.5a13 13 0 0 0-6 0C6 .1 4.6 1 4.6 1a5 5 0 0 0-.1 3.7A5.5 5.5 0 0 0 3 8.5c0 5.4 3.3 6.6 6.5 7-.6.5-.5 1.3-.5 2"/>}
  </svg>;
}
