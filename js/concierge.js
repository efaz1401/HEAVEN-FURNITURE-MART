/* ==========================================================================
   js/concierge.js — VIP Concierge Consultation Drawer
   3-Tier VIP Consultation booking modal with focus-trap & WhatsApp routing
   ========================================================================== */

import { WHATSAPP } from '../data/pieces.js';
import { currentLang, LANG_EVENT } from '../data/i18n.js';

export function initConcierge() {
  const modal = document.getElementById('concierge-modal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('[data-open-concierge]');
  const closeBtns = modal.querySelectorAll('[data-close-concierge]');
  const backdrop = modal.querySelector('.concierge-backdrop');
  let previouslyFocused = null;

  function updateTierLinks() {
    const isBn = currentLang() === 'bn';
    const tier1Btn = modal.querySelector('[data-tier="1"]');
    const tier2Btn = modal.querySelector('[data-tier="2"]');
    const tier3Btn = modal.querySelector('[data-tier="3"]');

    if (tier1Btn) {
      const msg = isBn
        ? `আসসালামু আলাইকুম হেভেন ফার্নিচার মার্ট। আমি আপনাদের আগ্রাবাদ শো-রুমে একটি ব্যক্তিগত ভিজিট ও পরামর্শের জন্য সময় নির্ধারণ করতে চাই।`
        : `Hello Heaven Furniture Mart. I would like to reserve a Private Showroom Walkthrough at your Agrabad showroom.`;
      tier1Btn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }

    if (tier2Btn) {
      const msg = isBn
        ? `আসসালামু আলাইকুম হেভেন ফার্নিচার মার্ট। আমি চট্টগ্রামে আমার বাসায় কমপ্লিমেন্টারি লেজার পরিমাপ ও কাঠের নমুনা দেখার অ্যাপয়েন্টমেন্ট বুক করতে চাই।`
        : `Hello Heaven Furniture Mart. I would like to schedule a Complimentary In-Home Space Measurement in Chattogram.`;
      tier2Btn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }

    if (tier3Btn) {
      const msg = isBn
        ? `আসসালামু আলাইকুম হেভেন ফার্নিচার মার্ট। আমি কারখানা থেকে সরাসরি আসবাবের কাজ দেখার জন্য একটি লাইভ হোয়াটসঅ্যাপ ভিডিও কল শিডিউল করতে চাই।`
        : `Hello Heaven Furniture Mart. I would like to schedule a Live Workshop Video Walkthrough via WhatsApp.`;
      tier3Btn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }
  }

  function openModal() {
    previouslyFocused = document.activeElement;
    modal.removeAttribute('hidden');
    // Force reflow for transition
    void modal.offsetWidth;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    updateTierLinks();

    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (!modal.classList.contains('is-open')) {
        modal.setAttribute('hidden', '');
      }
    }, 350);

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  window.addEventListener(LANG_EVENT, () => {
    if (modal.classList.contains('is-open')) {
      updateTierLinks();
    }
  });
}
