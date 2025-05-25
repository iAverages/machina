import CirclePlay from "~icons/lucide/circle-play";
import Clock from "~icons/lucide/clock";
import Headphones from "~icons/lucide/headphones";
import Music from "~icons/lucide/music2";

const prettyNumberFormat = (value: number) => {
    return new Intl.NumberFormat(undefined, {}).format(value);
};

export const OverviewStats = (props: {
    totalListeningHours: number;
    uniqueTracks: number;
    totalPlays: number;
    weeklyAverage: number;
}) => {
    const totalListeningHours = () => `${prettyNumberFormat(props.totalListeningHours)}h`;
    const uniqueTracks = () => prettyNumberFormat(props.uniqueTracks);
    const totalPlays = () => prettyNumberFormat(props.totalPlays);
    const weeklyAverage = () => `${prettyNumberFormat(props.weeklyAverage)}h`;

    return (
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-4 flex items-center">
                <div class="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <Headphones class="h-5 w-5 text-green-500" />
                </div>
                <div>
                    <div class="text-xs text-zinc-400">Total Listens</div>
                    <div class="text-xl font-bold">{totalListeningHours()}</div>
                </div>
            </div>

            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-4 flex items-center">
                <div class="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                    <Music class="h-5 w-5 text-purple-500" />
                </div>
                <div>
                    <div class="text-xs text-zinc-400">Unique Tracks</div>
                    <div class="text-xl font-bold">{uniqueTracks()}</div>
                </div>
            </div>

            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-4 flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                    <CirclePlay class="h-5 w-5 text-blue-500" />
                </div>
                <div>
                    <div class="text-xs text-zinc-400">Total Plays</div>
                    <div class="text-xl font-bold">{totalPlays()}</div>
                </div>
            </div>

            <div class="bg-zinc-900/70 rounded-xl border border-zinc-800 p-4 flex items-center">
                <div class="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                    <Clock class="h-5 w-5 text-orange-500" />
                </div>
                <div>
                    <div class="text-xs text-zinc-400">Weekly Average</div>
                    <div class="text-xl font-bold">{weeklyAverage()}</div>
                </div>
            </div>
        </div>
    );
};
