'use client';
// src/components/shared/PetIllustrators.tsx
// Running puppies/cats in background at low opacity

const pets = ['🐶','🐱','🐕','🐈','🐩','🐾'];

export default function PetIllustrators({ count = 3 }: { count?: number }) {
  return (
    <div className="pet-bg" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="pet-run select-none"
          style={{
            bottom: `${10 + (i * 18)}%`,
            animationDelay: `${i * -4.5}s`,
            animationDuration: `${14 + i * 4}s`,
            fontSize: `${3.5 + i * 0.8}rem`,
          }}
        >
          {pets[i % pets.length]}
        </span>
      ))}
    </div>
  );
}
