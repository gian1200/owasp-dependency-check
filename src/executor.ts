import {cleanDir, getJavaToolOptions, log} from "./utils.js";
import path from "path";
import {exec, SpawnOptions} from "child_process";
import {spawn} from "cross-spawn";
import colors from '@colors/colors/safe.js';
import {getCmdArguments} from "./cli.js";

export async function runDependencyCheck(executable: string, outDir: string) {
    await cleanDir(path.resolve(process.cwd(), outDir));

    const env = process.env;
    if (getJavaToolOptions()) {
        env.JAVA_TOOL_OPTIONS = getJavaToolOptions();
    }
    const opts = {
        cwd: path.resolve(process.cwd()),
        maxBuffer: 1024 * 1024 * 50,
        env: env,
    };

    const spawnOpts: SpawnOptions = {
        cwd: path.resolve(process.cwd()),
        shell: false,
        stdio: 'inherit'
    };

    const cmdVersion = `${executable} --version`;
    const cmdArguments = getCmdArguments();
    const cmd = `${executable} ${cmdArguments.join(' ')}`;

    // TODO: handle system out/err
    exec(cmdVersion, opts, (err, _stdout, _stderr) => {
        if (err) {
            console.error(err);
            console.error(_stderr);
            return;
        }

        const re = /\D* (\d+\.\d+\.\d+).*/;
        const versionMatch = re.exec(_stdout);

        log('Dependency-Check Core path:', executable);
        log('Dependency-Check Core version:', versionMatch ? versionMatch[1] : _stdout);

        log('Running command:\n', cmd);
        const exececutableSpawn = spawn(executable, cmdArguments, spawnOpts);
        exececutableSpawn.on('close', () => {
            log(colors.green('Done.'));
        });
    });
}
