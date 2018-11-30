import IWebpackCompilation from './IWebpackCompilation';
export default interface WebpackCompiler {
    hooks: {
        compilation: {
            tap: (pluginName: string, handler: (compilation: IWebpackCompilation) => void) => void;
        };
        emit: {
            tap: (pluginName: string, handler: (compilation: IWebpackCompilation) => void) => void;
        };
    };
    context: string;
    inputFileSystem: any;
    plugin?: (phase: string, callback: Function) => void;
}
