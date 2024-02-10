export interface Metadata {
    /**
     * The ASM entry point of the module
     */
    asmEntry?: string;
    /**
     * The js functions that you are exposing to your ASM
     */
    asmExposedFunctions?: { [key: string]: any };
    /**
     * A changelog to be printed when the module is updated
     */
    changelog?: string;
    /**
     * The creator of the module
     */
    creator?: string;
    /**
     * The description of the module
     */
    description?: string;
    /**
     * The entry point of the module
     */
    entry?: string;
    /**
     * The chat message to be sent on import
     */
    helpMessage?: string;
    /**
     * Appears to do nothing
     */
    ignored?: string[];
    /**
     * States whether this module will be a dependancy
     */
    isRequired?: boolean;
    /**
     * The name of the module
     */
    name?: string;
    /**
     * The imgur link for the image of the module
     */
    pictureLink?: string;
    /**
     * The list of dependencies of the module
     */
    requires?: string[];
    /**
     * The tags of the module
     */
    tags?: string[];
    /**
     * The version of the module
     */
    version?: string;
}
export interface config {
    $schema: string,
    purge: string[]
}