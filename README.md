# Janopriyo Shop - Multi-Version Dynamic SaaS E-Commerce Platform

Janopriyo Shop is a high-performance, modular, and dynamically customisable e-commerce application built on Next.js. It features a custom component registry pattern, enabling live configuration of storefront variations (Navbars, Heros, Product Cards, Footers, and Detail views) alongside instant branding updates through CSS variables.

---

## Introduction

Janopriyo Shop serves as a flexible storefront builder where client configurations determine the layout and aesthetic of the web application. Rather than deploying static codebases, the project dynamically selects UI layouts and color presets (e.g., vintage, ocean, tangerine, clay, catppuccin, cyberpunk) from a central administrative panel. This architecture decouples design choices from source code deployments. Integrated with secure database structures, local payment gateway adapters, automated shipping provider integrations, and progressive offline assets, Janopriyo Shop balances developer control with client-facing adaptability.

---

## Unique Selling Point

The core advantages that differentiate Janopriyo Shop from traditional systems include:

* **Dynamic Registry Selection**: Seamlessly swap storefront components (Navbars V1-V5, Product Cards V1-V5, Product Details V1-V5, Blog Details V1-V5, and Footers V1-V5) at runtime directly from the admin interface.
* **Instant Dynamic Brand Painting**: Alter the brand colors, logo typography, and body fonts instantly. The system maps selected configuration variables across the DOM without rebuilding the production bundle.
* **Mongoose Schema Cryptography**: Sensitive credentials like courier secret keys, OpenRouter tokens, and SSLCommerz passwords are encrypted and decrypted automatically using authenticated AES-256-GCM.
* **On-Platform AI Assistant**: An automated chat agent using OpenRouter API (`glm-4.5-air:free`) that storefront admins can train with custom brand rules and guidelines.
* **Combined Ledger Tracking**: Live expense logs side-by-side with order histories, payment statuses, and user digital wallets to simplify accounting.
* **Mobile-First Progressive Installability**: Fast initial loads with Lenis smooth scrolling, Google Tag Manager scripts, Facebook Pixel triggers, and automated service workers for offline browsing.

---

## Project Goal

The primary goal of Janopriyo Shop is to provide a single-deployment, highly customisable SaaS storefront application. It allows business owners to manage visual themes, coordinate inventory, log administrative expenses, execute courier bookings, and interact with customers using AI assistance, all without requesting developers to build new code templates or change server structures.

---

## Problem Solved

Traditional e-commerce architectures face several limitations:

* **Rigid Layout Templates**: Changing a website's visual theme or switching to a new navigation design requires manual code alterations, testing, and rebuilds.
* **Workflow Fragmentation**: Retailers are forced to balance separate platforms for accounting, shipping, customer chats, and inventory logging, leading to transcription mistakes and lost hours.
* **API Key Exposure Risk**: Storing merchant credentials in database records risks major security leaks if the database is exposed or API endpoints lack strict serialization filters.
* **Connection Latency**: Standard e-commerce platforms do not perform well on unstable mobile networks, leading to interrupted checkout states and cart abandonment.

---

## Impact of the Solution

Janopriyo Shop directly addresses these issues with measurable benefits:

* **Instantaneous Layout Changes**: Store owners can run visual updates or run A/B testing on product card designs without server downtime or additional development costs.
* **Centralised Operations Dashboard**: Administrative users can manage products, track delivery status updates, audit expenses, and review digital wallet balances in one interface.
* **High-Security Standards**: Schema-level encryption ensures that all third-party courier tokens and payment credentials remain securely encrypted in the database.
* **Resilient Offline Browsing**: PWA assets and client-side local storage caches keep the cart and wishlist intact even when the customer loses mobile data connectivity, protecting sales.

---

## Detailed Features

Here is a list of the core features included in the application:

### 1. Dynamic Theme Engine and Layout Customisation
* **What it is**: A system design console that maps component styles (Navbars V1-V5, Product Cards V1-V5, Footers V1-V5) and color configurations to the page structure dynamically.
* **User Benefit**: Store owners can instantly rebrand their storefront layout, typography, and theme accents to match seasonal events or target audiences without writing code.
* **Technical Challenges**: Managing theme styling settings across server-side rendered (SSR) layout frames and client-side hydrated (CSR) interactive blocks without layout shifts, page flashes, or style flickering (FOUC).
* **Technical Resolution**: Configured Next.js layout metadata, server-cached settings retrieval, and Tailwind CSS v4 variables mapped directly inside the main document body container class names (e.g. `theme-ocean font-poppins`).
* **Non-technical Challenges**: Preventing layout breaks and bad color contrast ratios when users select custom color palettes and typography.
* **Non-technical Resolution**: Defined strict visual guidelines utilizing theme-relative Tailwind utility classes (e.g., `bg-primary`, `text-primary-foreground`) instead of hardcoding static classes or colors.
* **Technologies Used**: Next.js (SSR), Tailwind CSS v4, CSS Variables, Mongoose, MongoDB.

### 2. Janopriyo AI Chatbot Assistant
* **What it is**: An automated chat client embedded into the store design that handles user inquiries using a custom LLM route.
* **User Benefit**: Customers receive instant responses to product questions at any time, lowering customer service waiting times and increasing orders.
* **Technical Challenges**: Minimising API token expenses and protecting the backend route from abuse or prompt injection.
* **Technical Resolution**: Designed a Next.js Route handler with system prompt filters, message size boundaries, maximum request rules, and integrated the free OpenRouter GLM model (`glm-4.5-air:free`).
* **Non-technical Challenges**: Tailoring the chatbot's voice and knowledge to match different merchant brands.
* **Non-technical Resolution**: Built an admin settings panel that lets store owners customize the system prompt and instructions for the chatbot.
* **Technologies Used**: OpenAI Node SDK, OpenRouter API, Next.js, Framer Motion, Lucide Icons.

### 3. Integrated Logistics and Courier Adapter
* **What it is**: An automated delivery booking tool that connects store order forms directly with local delivery services (Steadfast, Pathao, Redx).
* **User Benefit**: Admins can generate tracking IDs, prepare parcel manifests, and request pickups directly from the admin panel without manual copy-pasting.
* **Technical Challenges**: Harmonising different vendor API payloads, authentication requirements, and error messages into one tracking pipeline.
* **Technical Resolution**: Created a structured Courier Configuration schema inside Mongoose that holds keys for each provider and routes orders via dynamically instantiated API client wrappers.
* **Non-technical Challenges**: Handling logistics errors or wrong courier information without breaking checkout flows for customers.
* **Non-technical Resolution**: Isolated courier operations to the background admin panel and decoupled public checkout states from shipping provider actions.
* **Technologies Used**: Next.js API Routes, Mongoose, Axios.

### 4. SSLCommerz Payment Gateway Integration
* **What it is**: Secure payment integration supporting credit cards, debit cards, and mobile banking systems (bKash, Nagad, Rocket).
* **User Benefit**: Shoppers can check out securely using familiar payment methods, leading to fewer abandoned checkouts.
* **Technical Challenges**: Verifying IPN (Instant Payment Notification) postbacks and webhooks to verify transactions without double-charging or skipping state updates.
* **Technical Resolution**: Implemented a secure validation pipeline with signature checking and state machine updates on the Order model.
* **Non-technical Challenges**: Providing testing options so store owners can test payments before going live.
* **Non-technical Resolution**: Configured sandbox and live settings toggles inside the admin panel, allowing store owners to test transaction routes safely.
* **Technologies Used**: `sslcommerz-lts`, Mongoose, Next.js API Handlers.

### 5. Secure Schema Credentials Cryptography
* **What it is**: An encryption process built into Mongoose database schemas to protect sensitive merchant data.
* **User Benefit**: Store owners' financial credentials and courier API keys are kept safe from unauthorized database access.
* **Technical Challenges**: Encrypting sensitive data without causing slow page loads during configuration lookups.
* **Technical Resolution**: Applied AES-256-GCM authenticated encryption using scrypt key derivation. Overrode the `toJSON` serialization methods to automatically strip sensitive credentials from API outputs.
* **Non-technical Challenges**: Restricting roles so only the Super Admin can view or update key settings.
* **Non-technical Resolution**: Configured strict path validation rules restricting configuration overrides solely to authenticated admins and the designated super admin account (`imranshuvo101@gmail.com`).
* **Technologies Used**: Node.js Crypto API, Mongoose Middleware, NextAuth.

### 6. Blogging & CMS with Rich Text Editor
* **What it is**: A built-in blog editor using Novel and Tiptap for writing articles and content.
* **User Benefit**: Store owners can write SEO-friendly posts to build organic traffic without needing third-party CMS platforms.
* **Technical Challenges**: Safely rendering user-generated HTML content without exposing the site to cross-site scripting (XSS) attacks.
* **Technical Resolution**: Integrated `isomorphic-dompurify` to sanitize HTML output before rendering it inside the versioned blog template components.
* **Non-technical Challenges**: Providing a simple writing experience for non-technical writers.
* **Non-technical Resolution**: Implemented the Novel editor with drag-and-drop media support, quick shortcuts, formatting tools, and automatic reading-time estimators.
* **Technologies Used**: Novel, Tiptap, DOMPurify, Next.js Dynamic Routes, MongoDB.

### 7. Customer Wallet and Transaction Ledger
* **What it is**: An on-platform wallet system allowing users to deposit funds, receive promotional cashbacks, and make quick purchases.
* **User Benefit**: Registered customers can manage their shop credits and complete checkouts instantly with single-click wallet payments.
* **Technical Challenges**: Maintaining absolute data integrity and avoiding race conditions or balance calculation errors during high concurrent traffic.
* **Technical Resolution**: Utilised MongoDB Session managers and atomic database updates (`$inc`) to manage changes to user wallets and transaction logs.
* **Non-technical Challenges**: Explaining transaction histories clearly to keep customer trust.
* **Non-technical Resolution**: Created a detailed transactions overview component for the user dashboard, displaying timestamps, order IDs, and clear transaction descriptions.
* **Technologies Used**: Mongoose Transactions, React, Tailwind CSS v4.

### 8. Progressive Web App (PWA) with Offline Fallback
* **What it is**: A service worker and manifest configuration that turns the web app into an installable mobile experience.
* **User Benefit**: Customers on slow mobile networks can access the site, view loaded pages, and access their shopping cart offline.
* **Technical Challenges**: Syncing cart changes and wishlists when moving between offline and online states.
* **Technical Resolution**: Created custom React state components (`CartHydrator` and `WishlistHydrator`) that synchronize local browser storage state with server-side database user profiles.
* **Non-technical Challenges**: Alerting users clearly when they are browsing offline.
* **Non-technical Resolution**: Built a dedicated offline fallback page (`offline/page.tsx`) that prompts users when internet connection is lost.
* **Technologies Used**: PWA Manifest API, Next.js metadata API, Service Workers.

---

## Conclusion

Janopriyo Shop provides a modern, fast, and secure SaaS e-commerce framework. By utilizing Next.js, Tailwind CSS v4, and MongoDB, it delivers a customisable e-commerce solution. Features like dynamic theme switching, built-in AI support, secure automated logistics, schema-level cryptography, and PWA capabilities make it a reliable and scalable choice for online retail.
