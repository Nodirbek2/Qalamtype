import React, { useState } from 'react';
import { defaultAvatar } from '../lib/avatars';

export function UserAvatar({ uid, name, photoURL, className = 'h-10 w-10' }: {
  uid: string; name: string; photoURL?: string; className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const source = photoURL && photoURL !== failedUrl ? photoURL : defaultAvatar(uid || name);
  return <img src={source} alt={name} referrerPolicy="no-referrer" decoding="async"
    onError={() => { if (photoURL && source === photoURL) setFailedUrl(photoURL); }}
    className={`rounded-full object-cover shrink-0 ${className}`}/>;
}
