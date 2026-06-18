'use client';

import { useState } from 'react';
import { useOrgStore } from '@/store/orgStore';

interface ReviewFormData {
  name: string;
  rating: number;
  comment: string;
}

export function PopupFormReview() {
  const organization = useOrgStore((s) => s.organization);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ReviewFormData>({ name: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm({ name: '', rating: 5, comment: '' });
    }, 2000);
  }

  return (
    <div className="mt-3 text-center">
      <button
        onClick={() => setOpen(true)}
        className="mt-5 px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
        style={{ background: accentColor }}
      >
        Add reviews
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[900px] mx-4 rounded shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-3">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-black text-2xl leading-none"
                aria-label="Close review form"
              >
                &#10005;
              </button>
            </div>

            <div className="px-8 pb-8">
              <h3 className="text-2xl font-bold text-black mb-6 text-center">Leave a Review</h3>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">&#10003;</div>
                  <p className="text-green-600 font-semibold">Thank you for your review!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-left">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Enter your name"
                      className="w-full border border-black px-3 py-2 rounded-none text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-left">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm({ ...form, rating: star })}
                          className="text-2xl transition-colors"
                          style={{ color: star <= form.rating ? accentColor : '#ccc' }}
                          aria-label={`Rate ${star} out of 5`}
                        >
                          &#9733;
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-left">Comment</label>
                    <textarea
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      rows={4}
                      placeholder="Share your experience..."
                      className="w-full border border-black px-3 py-2 rounded-none text-sm focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: accentColor }}
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
