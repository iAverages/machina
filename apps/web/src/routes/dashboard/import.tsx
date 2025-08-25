import { createFileRoute } from "@tanstack/solid-router";
import JSZip from "jszip";
import { type Accessor, createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import z from "zod";
import { FileDropzone, FileDropzoneError } from "~/components/file-dropzone";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/utils/cn";
import { trytmSync } from "~/utils/trytm";
import CheckCircle from "~icons/lucide/check-circle";
import FileText from "~icons/lucide/file-text";
import Loader2 from "~icons/lucide/loader-circle";
import Upload from "~icons/lucide/upload";

export const Route = createFileRoute("/dashboard/import")({
    component: RouteComponent,
});

const Steps = {
    Upload: "upload",
    Select: "select",
    Process: "process",
    Complete: "complete",
} as const;

type Steps = (typeof Steps)[keyof typeof Steps];

function RouteComponent() {
    const [step, setStep] = createSignal<Steps>(Steps.Upload);
    const [files, _setFiles] = createSignal<UploadedFile[]>([]);
    const [selectedFiles, setSelectedFiles] = createSignal<UploadedFile[]>([]);

    const handleFileSelect = (newFiles: UploadedFile[]) => {
        _setFiles(newFiles);
        setStep(Steps.Select);
    };

    return (
        <div class="max-w-4xl mx-auto space-y-6 w-full">
            <div class="text-center space-y-2">
                <h1 class="text-3xl font-bold text-foreground">Spotify History Importer</h1>
                <p class="text-muted-foreground">Upload .json or .zip file from Spotify export</p>
            </div>
            <div class="flex items-center justify-center space-x-4 mb-8">
                <For
                    each={[
                        { step: "upload", label: "Upload", icon: Upload },
                        { step: "select", label: "Select", icon: CheckCircle },
                        { step: "process", label: "Process", icon: FileText },
                        { step: "complete", label: "Complete", icon: CheckCircle },
                    ]}
                >
                    {({ step: stepName, label, icon: Icon }, index) => (
                        <div class="flex items-center">
                            <div
                                class={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                                    stepName === step()
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : index() < ["upload", "select", "process", "complete"].indexOf(stepName)
                                          ? "bg-green-100 text-green-600 border-green-200"
                                          : "bg-muted text-muted-foreground border-border",
                                )}
                            >
                                <Icon class="w-5 h-5" />
                            </div>
                            <span class="ml-2 text-sm font-medium">{label}</span>
                            <Show when={index() < 3}>
                                <div class="w-8 h-px bg-border ml-4" />
                            </Show>
                        </div>
                    )}
                </For>
            </div>
            <Switch>
                <Match when={step() === Steps.Upload}>
                    <UploadStep
                        files={files()}
                        setFiles={(newFiles) => {
                            handleFileSelect(typeof newFiles === "function" ? newFiles(files()) : newFiles);
                        }}
                    />
                </Match>

                <Match when={step() === Steps.Select}>
                    <SelectStep
                        files={files}
                        startProcessing={(files) => {
                            console.log("selected files for importing", files);
                            setSelectedFiles(files);
                            setStep(Steps.Process);
                        }}
                    />
                </Match>
                <Match when={step() === Steps.Process}>
                    <ProcessStep files={selectedFiles} />
                </Match>
            </Switch>
        </div>
    );
}

type UploadedFile = { name: string; content: string };

type UploadStepProps = {
    files: UploadedFile[];
    setFiles: (files: UploadedFile[] | ((files: UploadedFile[]) => UploadedFile[])) => void;
};

const UploadStep = (props: UploadStepProps) => {
    const [isExtractingZip, setIsExtractingZip] = createSignal(false);

    const [messages, setMessages] = createSignal<{ message: string; type: "info" | "error" }[]>([]);
    const addMessage = (message: string) => setMessages((prev) => [...prev, { message, type: "info" }]);

    const addError = (message: string) => setMessages((prev) => [...prev, { message, type: "error" }]);

    const handleFileSelect = async (files: File[]) => {
        const validFiles: UploadedFile[] = [];
        for (const file of files) {
            addMessage(`Selected file: ${file.name}`);

            if (file.type === "application/json") {
                addMessage("Reading JSON file...");
                try {
                    const content = await file.text();
                    validFiles.push({ name: file.name, content, type: "json", selected: true });
                    addMessage("JSON file loaded successfully.");
                } catch (error) {
                    addError(`Failed to read JSON file: ${(error as Error).message}`);
                }
            } else if (file.type === "application/zip" || file.name.endsWith(".zip")) {
                addMessage("Unzipping file client-side...");
                setIsExtractingZip(true);

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const zip = await JSZip.loadAsync(arrayBuffer);

                    const jsonFiles: UploadedFile[] = [];
                    let foundJson = false;

                    for (const filename in zip.files) {
                        const zipEntry = zip.files[filename]!;

                        if (zipEntry.dir || !filename.toLowerCase().endsWith(".json")) {
                            continue;
                        }

                        foundJson = true;
                        const content = await zipEntry.async("string");
                        jsonFiles.push({ name: filename, content });
                    }

                    if (!foundJson) {
                        addError("ZIP file contains no JSON files or is empty.");
                    } else {
                        addMessage(`Found ${jsonFiles.length} JSON files in ZIP.`);
                        validFiles.push(
                            ...jsonFiles.map((f) => ({
                                name: f.name,
                                content: f.content,
                            })),
                        );
                    }
                } catch (error) {
                    addError(`ZIP processing error: ${(error as Error).message}`);
                } finally {
                    setIsExtractingZip(false);
                }
            } else {
                addError("Unsupported file type. Please upload a .json or .zip file.");
            }
        }

        props.setFiles(validFiles);
    };

    // TODO:
    const handleFileError = (error: FileDropzoneError) => {
        console.log({ error });
    };

    return (
        <Card>
            <CardHeader class="flex flex-col">
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Drag and drop your JSON files or ZIP archives, or click to browse</CardDescription>
            </CardHeader>
            <CardContent>
                <FileDropzone
                    multiple
                    accept=".json,.zip,application/json,application/zip"
                    onFilesSelected={handleFileSelect}
                    onError={handleFileError}
                >
                    <Show when={isExtractingZip()}>
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                    </Show>
                </FileDropzone>
            </CardContent>
        </Card>
    );
};

type SelectStepProps = {
    files: Accessor<UploadedFile[]>;
    startProcessing: (files: UploadedFile[]) => void;
};

const SelectStep = (props: SelectStepProps) => {
    const [selectedFiles, setSelectedFiles] = createSignal<string[]>([]);
    onMount(() => setSelectedFiles(props.files().map((f) => f.name)));

    const selectAllFiles = () => setSelectedFiles(props.files().map((f) => f.name));
    const deselectAllFiles = () => setSelectedFiles([]);
    const toggleFileSelection = (fileName: string) => {
        const isSelected = selectedFiles().find((file) => file === fileName);
        if (isSelected) setSelectedFiles((prev) => prev.filter((file) => file !== fileName));
        else setSelectedFiles((prev) => [...prev, fileName]);
    };

    return (
        <Card>
            <CardHeader class="gap-2">
                <CardTitle>Select Files to Process</CardTitle>
                <CardDescription>Choose which files you want to import into the system</CardDescription>
                <div class="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllFiles}>
                        Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllFiles}>
                        Deselect All
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div class="max-h-96 overflow-scroll">
                    <div class="space-y-2">
                        <For each={props.files()}>
                            {(file) => (
                                <div class="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                                    <Checkbox
                                        checked={!!selectedFiles().find((f) => f === file.name)}
                                        onChange={() => toggleFileSelection(file.name)}
                                    />
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center space-x-2">
                                            <FileText class="w-4 h-4 text-muted-foreground" />
                                            <span class="font-medium truncate">{file.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </For>
                    </div>
                </div>
                <Separator class="my-4" />
                <div class="flex justify-between">
                    <Button
                        onClick={() =>
                            props.startProcessing(
                                props.files().filter((fileName) => !!selectedFiles().includes(fileName.name)),
                            )
                        }
                        disabled={selectedFiles().length === 0}
                    >
                        Start Import ({selectedFiles().length} files)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

type ProcessStepProps = {
    files: Accessor<UploadedFile[]>;
};

const fileSchema = z.object({ ts: z.coerce.date(), spotify_track_uri: z.string().startsWith("spotify:track:") });

const ProcessStep = (props: ProcessStepProps) => {
    const [currentProcessingFile, setCurrentProcessingFile] = createSignal("");
    const [completeFiles, setCompleteFiles] = createSignal<string[]>([]);
    const [invalidFiles, setInvalidFiles] = createSignal<string[]>([]);

    const processingProgress = () => (completeFiles().length / props.files().length) * 100;

    onMount(async () => {
        const bigFuckoffArray = [];
        for (const file of props.files()) {
            setCurrentProcessingFile(file.name);
            const [json, error] = trytmSync(JSON.parse(file.content));
            if (error) {
                console.error("failed to json parse file", file.name);
                setInvalidFiles((prev) => [...new Set([...prev, file.name])]);
                continue;
            }

            let index = 0;
            for (const listen of json) {
                const validator = fileSchema.safeParse(listen);
                if (validator.success) {
                    bigFuckoffArray.push(validator.data);
                } else {
                    console.error("failed to validate listen", { file: file.name, listenIndex: index });
                    setInvalidFiles((prev) => [...new Set([...prev, file.name])]);
                }
                index++;
            }
            // stops the ui from being blocked
            await new Promise((res) => setTimeout(res, 1));
            setCompleteFiles((prev) => [...prev, file.name]);
        }
        console.log(bigFuckoffArray);
    });

    return (
        <div class="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Processing Files</CardTitle>
                    <CardDescription>Importing your data into the system...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span>Overall Progress</span>
                                <span>{Math.round(processingProgress())}%</span>
                            </div>
                            <Progress value={processingProgress()} class="w-full" />
                        </div>

                        <div class="h-96 overflow-scroll">
                            <div class="space-y-2">
                                <For each={props.files()}>
                                    {(file) => (
                                        <div class="flex items-center justify-between p-2 border rounded">
                                            <div class="flex items-center space-x-2">
                                                <FileText class="w-4 h-4" />
                                                <span class="text-sm font-medium">{file.name}</span>
                                            </div>
                                            <Switch>
                                                <Match when={completeFiles().includes(file.name)}>
                                                    <Badge variant={"success"}>Complete</Badge>
                                                </Match>

                                                <Match when={currentProcessingFile() === file.name}>
                                                    <Badge variant={"warning"}>Processing</Badge>
                                                </Match>

                                                <Match when={invalidFiles().includes(file.name)}>
                                                    <Badge variant={"error"}>Invalid</Badge>
                                                </Match>
                                                <Match when={true}>
                                                    <Badge variant={"outline"}>Pending</Badge>
                                                </Match>
                                            </Switch>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* {showLogs && ( */}
            {/*     <Card> */}
            {/*         <CardHeader> */}
            {/*             <CardTitle>Import Log</CardTitle> */}
            {/*             <CardDescription>Real-time processing information</CardDescription> */}
            {/*         </CardHeader> */}
            {/*         <CardContent> */}
            {/*             <ScrollArea class="h-48"> */}
            {/*                 <div class="space-y-1 font-mono text-sm"> */}
            {/*                     {logs.map((log) => ( */}
            {/*                         <div key={log.id} class="flex items-start space-x-2"> */}
            {/*                             <span class="text-muted-foreground text-xs"> */}
            {/*                                 {log.timestamp.toLocaleTimeString()} */}
            {/*                             </span> */}
            {/*                             <span class={`font-medium ${getLogColor(log.level)}`}> */}
            {/*                                 [{log.level.toUpperCase()}] */}
            {/*                             </span> */}
            {/*                             <span class="flex-1">{log.message}</span> */}
            {/*                         </div> */}
            {/*                     ))} */}
            {/*                 </div> */}
            {/*             </ScrollArea> */}
            {/*         </CardContent> */}
            {/*     </Card> */}
            {/* )} */}
        </div>
    );
};
