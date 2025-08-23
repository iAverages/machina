import { Input } from "@kobalte/core/text-field";
import { createFileRoute } from "@tanstack/solid-router";
import JSZip from "jszip";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { TextField } from "~/components/ui/text-field";
import { cn } from "~/utils/cn";
import Upload from "~icons/lucide/upload";
import Loader2 from "~icons/lucide/loader-circle";
import XCircle from "~icons/lucide/x-circle";
import { FileDropzone } from "~/components/file-dropzone";

export const Route = createFileRoute("/dashboard/import")({
    component: RouteComponent,
});

// Define the expected structure for a valid JSON file
interface ProcessedJsonFile {
    name: string;
    content: string;
    isValid: boolean;
    validationError?: string;
    processedData?: any; // The parsed JSON data
}

const Steps = {
    Upload: "upload",
    Select: "select",
    Process: "process",
    Complete: "complete",
} as const;

type Steps = (typeof Steps)[keyof typeof Steps];

function RouteComponent() {
    const [uploadedFiles, setUploadedFiles] = createSignal<
        { name: string; content: string; type: "json" | "zip"; selected: boolean }[]
    >([]);
    const [step, setStep] = createSignal<Steps>(Steps.Upload);
    const [messages, setMessages] = createSignal<{ message: string; type: "info" | "error" }[]>([]);
    const [isProcessing, setIsProcessing] = createSignal(false);
    // biome-ignore lint/style/noNonNullAssertion: solid
    let fileInputRef: HTMLInputElement = null!;

    const addMessage = (message: string) => setMessages((prev) => [...prev, { message, type: "info" }]);

    const addError = (message: string) => setMessages((prev) => [...prev, { message, type: "error" }]);

    const handleFileChange = async (event) => {
        setMessages([]);
        setUploadedFiles([]);

        const files = event.target.files;
        if (!files || files.length === 0) {
            addError("No file selected.");
            return;
        }

        for (const file of files) {
            addMessage(`Selected file: ${file.name}`);

            if (file.type === "application/json") {
                addMessage("Reading JSON file...");
                try {
                    const content = await file.text();
                    setUploadedFiles((prev) => [...prev, { name: file.name, content, type: "json", selected: true }]);
                    addMessage("JSON file loaded successfully.");
                } catch (error) {
                    addError(`Failed to read JSON file: ${(error as Error).message}`);
                }
            } else if (file.type === "application/zip" || file.name.endsWith(".zip")) {
                addMessage("Unzipping file client-side...");
                setIsProcessing(true);

                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const zip = await JSZip.loadAsync(arrayBuffer);

                    const jsonFiles: { name: string; content: string }[] = [];
                    let foundJson = false;

                    for (const filename in zip.files) {
                        // biome-ignore lint/style/noNonNullAssertion: will exist
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
                        setUploadedFiles(
                            jsonFiles.map((f) => ({
                                name: f.name,
                                content: f.content,
                                type: "json",
                                selected: true,
                            })),
                        );
                    }
                } catch (error) {
                    addError(`ZIP processing error: ${(error as Error).message}`);
                } finally {
                    setIsProcessing(false);
                }
            } else {
                addError("Unsupported file type. Please upload a .json or .zip file.");
            }
        }
    };

    const handleToggleSelect = (fileName: string) => {
        setUploadedFiles((prev) =>
            prev.map((file) => (file.name === fileName ? { ...file, selected: !file.selected } : file)),
        );
    };

    const processJsonFile = (file: { name: string; content: string }): ProcessedJsonFile => {
        try {
            const parsedData = JSON.parse(file.content);
            // Simple validation: check if it's an object and has 'title' and 'items'
            if (
                typeof parsedData === "object" &&
                parsedData !== null &&
                typeof parsedData.title === "string" &&
                Array.isArray(parsedData.items)
            ) {
                return { name: file.name, content: file.content, isValid: true, processedData: parsedData };
            }

            return {
                name: file.name,
                content: file.content,
                isValid: false,
                validationError: "JSON does not match expected format (missing 'title' or 'items' array).",
            };
        } catch (error) {
            return {
                name: file.name,
                content: file.content,
                isValid: false,
                validationError: `Invalid JSON format: ${(error as Error).message}`,
            };
        }
    };

    const handleProcessSelected = async () => {
        setMessages([]);
        setIsProcessing(true);
        const selected = uploadedFiles().filter((f) => f.selected);

        if (selected.length === 0) {
            addError("No JSON files selected for processing.");
            setIsProcessing(false);
            return;
        }

        addMessage(`Starting processing of ${selected.length} selected JSON files...`);

        const processedResults: ProcessedJsonFile[] = [];

        for (const file of selected) {
            addMessage(`Processing file: ${file.name}...`);
            const result = processJsonFile(file);
            processedResults.push(result);

            if (result.isValid) {
                addMessage(`Successfully processed ${file.name}. Title: "${result.processedData.title}"`);
            } else {
                addError(`Error in ${file.name}: ${result.validationError}`);
            }
        }

        addMessage("All selected files processed.");
        setIsProcessing(false);
    };

    return (
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="text-center space-y-2">
                <h1 class="text-3xl font-bold text-foreground">History Importe </h1>
                <p class="text-muted-foreground">Upload .json or .zip file from Spotify export</p>
            </div>
            <Switch>
                <Match when={step() === Steps.Upload}>
                    <UploadStep />
                </Match>
            </Switch>
        </div>
    );
    // return (
    //     <div class="p-4 md:p-6 lg:p-8 grid grid-cols-12 gap-4">
    //         <Card class="col-span-8">
    //             <CardHeader>
    //                 <CardTitle class="text-2xl font-bold">History Importer</CardTitle>
    //             </CardHeader>
    //             <CardContent class="space-y-6">
    //                 <div class="grid gap-2">
    //                     <Label for="file-upload">Upload .json or .zip file</Label>
    //                     <input
    //                         id="file-upload"
    //                         type="file"
    //                         accept=".json,.zip"
    //                         multiple
    //                         onChange={handleFileChange}
    //                         ref={fileInputRef}
    //                         disabled={isProcessing()}
    //                     />
    //                 </div>
    //
    //                 <Show when={uploadedFiles().length > 0}>
    //                     <div class="space-y-4">
    //                         <h3 class="text-lg font-semibold">Files to Process:</h3>
    //                         {/* <ScrollArea class="h-48 w-full rounded-md border p-4"> */}
    //
    //                         <For each={uploadedFiles()}>
    //                             {(file) => (
    //                                 <div class="flex items-center space-x-2 py-1">
    //                                     <Checkbox
    //                                         id={`file-${file.name}`}
    //                                         checked={file.selected}
    //                                         onChange={() => handleToggleSelect(file.name)}
    //                                         disabled={isProcessing()}
    //                                     />
    //                                     <Label for={`file-${file.name}`} class="flex items-center gap-2">
    //                                         {file.type === "json" ? (
    //                                             <FileJson class="h-4 w-4 text-blue-500" />
    //                                         ) : (
    //                                             <FileArchive class="h-4 w-4 text-purple-500" />
    //                                         )}
    //                                         {file.name}
    //                                     </Label>
    //                                 </div>
    //                             )}
    //                         </For>
    //                         {/* </ScrollArea> */}
    //                         <Button
    //                             onClick={handleProcessSelected}
    //                             class="w-full"
    //                             disabled={isProcessing() || uploadedFiles().filter((f) => f.selected).length === 0}
    //                         >
    //                             {isProcessing() && <Loader2 class="mr-2 h-4 w-4 animate-spin" />}
    //                             Process Selected Files
    //                         </Button>
    //                     </div>
    //                 </Show>
    //             </CardContent>
    //         </Card>
    //         <Card class="col-span-4 h-fit">
    //             <CardHeader>
    //                 <CardTitle>Activity Log</CardTitle>
    //             </CardHeader>
    //             <CardContent class="max-h-[500px] overflow-auto">
    //                 <Show when={messages().length > 0}>
    //                     <For each={messages()}>
    //                         {({ message, type }) => (
    //                             <Switch>
    //                                 <Match when={type === "info"}>
    //                                     <div class="flex gap-2 items-center">
    //                                         <CheckCircle class="min-w-4 size-4 text-green-500" />
    //                                         <p class="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 truncate">
    //                                             {message}
    //                                         </p>
    //                                     </div>
    //                                 </Match>
    //                                 <Match when={type === "error"}>
    //                                     <p class="text-sm text-red-600 flex items-center gap-2 truncate">
    //                                         <XCircle class="min-w-4 size-4 text-red-500" /> {message}
    //                                     </p>
    //                                 </Match>
    //                             </Switch>
    //                         )}
    //                     </For>
    //                 </Show>
    //             </CardContent>
    //         </Card>
    //     </div>
    // );
}
const UploadStep = () => {
    const [isExtractingZip, setIsExtractingZip] = createSignal(false);

    const handleFileSelect = (files: File[]) => {
        console.log({ files });
    };
    const handleFileError = (error) => {
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
