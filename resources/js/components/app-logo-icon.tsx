import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="40" height="40" rx="10" fill="#102A43" />
            <path
                d="M8 20.5H13.5L16.5 11.5L21.5 28.5L25 16.5L27.5 20.5H32"
                stroke="#55BDEB"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="21.5" cy="28.5" r="2" fill="#55BDEB" />
        </svg>
    );
}
