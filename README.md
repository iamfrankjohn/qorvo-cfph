# QORVO CFPH Website — No Meta / Responsive Facebook Fix

This version fixes the Facebook timeline card on desktop, tablet and mobile.

The previous iframe requested a fixed 500px Facebook plugin even when the card
was much narrower. This version measures the actual card width and reloads the
Facebook Page Plugin using the correct width.

Server Intel remains automatic with a safe fallback to the official CrossFire
Philippines news page when the official site cannot be parsed server-side.
