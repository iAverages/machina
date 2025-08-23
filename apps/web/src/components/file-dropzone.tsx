import { createSignal, type JSX, Show } from "solid-js";
import { cn } from "~/utils/cn";
import Upload from "~icons/lucide/upload";

export type FileDropzoneError = {
    type: "invalid_file_type" | "multiple_files_not_allowed" | "no_files_selected";
    message: string;
    file?: File;
    acceptedTypes?: string[];
};

export type FileDropzoneProps = {
    children?: JSX.Element;
    accept?: string;
    multiple?: boolean;
    onFilesSelected?: (files: File[]) => void;
    onError?: (error: FileDropzoneError) => void;
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    description?: string;
    title?: string;
    disabled?: boolean;
};

export const FileDropzone = (props: FileDropzoneProps) => {
    let inputRef: HTMLInputElement = null!;
    const [isDragOver, setIsDragOver] = createSignal(false);

    const multiple = () => props.multiple ?? true;
    const description = () => props.description ?? "Drag and drop files here or click to browse";
    const title = () => props.title ?? "Upload files";

    const getAcceptedTypes = (): string[] => {
        return props.accept ? props.accept.split(",").map((type) => type.trim()) : [];
    };

    const validateFiles = (files: File[]): boolean => {
        if (!props.accept) return true;

        const acceptedTypes = getAcceptedTypes();

        for (const file of files) {
            const isValid = acceptedTypes.some((acceptedType) => {
                if (acceptedType.startsWith(".")) {
                    return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
                }
                return file.type === acceptedType || file.type.startsWith(`${acceptedType.split("/")[0]}/`);
            });
            if (!isValid) {
                props.onError?.({
                    type: "invalid_file_type",
                    message: `File "${file.name}" is not a supported file type`,
                    file,
                    acceptedTypes,
                });
                return false;
            }
        }
        return true;
    };

    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) {
            props.onError?.({
                type: "no_files_selected",
                message: "No files were selected",
            });
            return;
        }

        const fileArray = Array.from(files);

        if (!multiple() && fileArray.length > 1) {
            props.onError?.({
                type: "multiple_files_not_allowed",
                message: "Only one file is allowed",
                acceptedTypes: getAcceptedTypes(),
            });
            return;
        }

        if (validateFiles(fileArray)) {
            props.onFilesSelected?.(fileArray);
        }
    };

    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
        props.onDragEnter?.();
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // TODO: is this needed?
        // Only set drag over to false if leaving the dropzone entirely
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDragOver(false);
            props.onDragLeave?.();
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (props.disabled) return;

        processFiles(e.dataTransfer?.files ?? null);
    };

    const handleFileInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        processFiles(target.files);
        target.value = "";
    };

    const handleClick = () => {
        if (!props.disabled) {
            inputRef.click();
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                id="file-input"
                type="file"
                multiple={multiple()}
                accept={props.accept}
                onChange={handleFileInput}
                class="hidden"
                disabled={props.disabled}
            />
            <button
                type="button"
                aria-label="File upload area"
                class={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                    props.disabled
                        ? "border-border/50 cursor-not-allowed opacity-50"
                        : isDragOver()
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 cursor-pointer",
                )}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                disabled={props.disabled}
            >
                <Upload class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 class="text-lg font-semibold mb-2">{title()}</h3>
                <p class="text-muted-foreground mb-4">{description()}</p>

                <Show
                    when={() => !!props.children}
                    fallback={<span class="text-primary hover:text-primary/80 font-medium">Browse Files</span>}
                >
                    {props.children}
                </Show>
            </button>
        </>
    );
};
