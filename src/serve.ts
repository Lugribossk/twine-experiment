import Bundler from "parcel";

const bundler = new Bundler(`src/index.html`, {
    outDir: `target/serve`,
    autoInstall: false,
    cache: false
});
bundler.addAssetType(".twee", require.resolve("./twee/TweeAsset"));
bundler.serve(8080);
