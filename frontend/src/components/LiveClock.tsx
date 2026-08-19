import { useEffect, useState } from "react";

const CENTER = 100;

function getHandAngles(date: Date) {
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const secondAngle = seconds * 6; // 360 / 60
    const minuteAngle = minutes * 6 + seconds * 0.1; // drift smoothly with seconds
    const hourAngle = hours * 30 + minutes * 0.5; // 360 / 12, drift with minutes

    return { hourAngle, minuteAngle, secondAngle };
}

// Hand color/geometry is set entirely via inline style/attributes below rather
// than external CSS classes — a class-based color rule silently not matching
// (typo, missing selector, load order) previously left the hour and minute
// hands invisible while only the hardcoded-color second hand rendered.
type HandProps = {
    angle: number;
    length: number;
    color: string;
    width: number;
    tailLength?: number;
};

function ClockHand({ angle, length, color, width, tailLength = 0 }: HandProps) {
    return (
        <line
            x1={CENTER}
            y1={CENTER + tailLength}
            x2={CENTER}
            y2={CENTER - length}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: `${CENTER}px ${CENTER}px`,
            }}
        />
    );
}

export default function LiveClock() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const { hourAngle, minuteAngle, secondAngle } = getHandAngles(now);

    const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateLabel = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

    return (
        <section className="live-clock-section">
            <div className="live-clock-card">
                <svg
                    className="live-clock-face"
                    viewBox="0 0 200 200"
                    role="img"
                    aria-label={`Current time ${timeLabel}`}
                >
                    <circle cx="100" cy="100" r="94" className="live-clock-rim" />
                    <circle cx="100" cy="100" r="88" className="live-clock-dial" />

                    {Array.from({ length: 12 }).map((_, i) => {
                        const angle = i * 30;
                        const isCardinal = i % 3 === 0;
                        return (
                            <line
                                key={i}
                                x1="100"
                                y1={isCardinal ? 18 : 22}
                                x2="100"
                                y2="30"
                                className="live-clock-tick"
                                style={{ transform: `rotate(${angle}deg)`, transformOrigin: "100px 100px" }}
                            />
                        );
                    })}

                    <text x="100" y="42" className="live-clock-numeral" textAnchor="middle">12</text>
                    <text x="164" y="106" className="live-clock-numeral" textAnchor="middle">3</text>
                    <text x="100" y="170" className="live-clock-numeral" textAnchor="middle">6</text>
                    <text x="36" y="106" className="live-clock-numeral" textAnchor="middle">9</text>

                    <ClockHand angle={hourAngle} length={42} color="#6e3482" width={6} />
                    <ClockHand angle={minuteAngle} length={62} color="#b8863a" width={4} />
                    <ClockHand angle={secondAngle} length={72} color="#c0392b" width={1.5} tailLength={12} />

                    <circle cx="100" cy="100" r="4.5" className="live-clock-pivot" />
                </svg>

                <div className="live-clock-info">
                    <span className="live-clock-time">{timeLabel}</span>
                    <span className="live-clock-date subtitle">{dateLabel}</span>
                </div>
            </div>
        </section>
    );
}