# UHRP Storage UI

Upload, list, renew and download UHRP content. Public downloads do not require
a wallet; upload, file listing and renewal connect to a BRC-100 wallet only when
requested. Mainnet and TerraTestNet downloads use the corresponding SDK network
presets. Production and staging upload providers are separate.

The storage wallet adapter copies the validated `Uint8Array` AtomicBEEF returned
by SDK 2.8.8’s binary wallet transport into the regular byte array required by
its BRC-105 payment client. It preserves SDK transaction validation, binding,
and all bytes; it does not reinterpret arbitrary objects or alter signatures.

The Evans Creek deployment is the frontend-only CARS project
`9b5ab73180b8edc0a9ac4394a3365ac6`, served at
<https://uhrp-ui.bapp.dev>. The older NanoStore UI is deprecated;
`nanostore-ui.babbage.systems` redirects to this UI through the operator-owned
Gateway API routes. NanoStore's GCP API and buckets remain separate.

Before releasing, run `npm ci`, then in `frontend` run `npm ci`,
`npm run typecheck`, `npm test`, and `npm audit`. `npm run build` at the project
root builds the CARS artifact. CI repeats verification on Node 22 and Node 24.
Releases currently use the existing operator wallet through `cars release now 1`
from a committed source checkout; no broad operator key is stored in this
public repository. Validate the served bundle and browser download/upload/file
listing flows after a release. Hosting and DNS operational evidence lives in
the Network Ops dossier.

Before an Evans Creek release, run Network Ops
`scripts/ops/preflight-uhrp-ui-release.sh`. It requires both the generated-host
and custom-domain certificates to be Ready and checks both serving URLs. For an
older CARS deployment, pre-issue the custom certificate using Network Ops
`config/envoy-gateway/uhrp-ui-cars-certificates.yaml`, keeping the existing
certificate and its SANs intact until the replacement is ready. CARS may select
the `-frontend-custom-tls` secret while processing a release; starting issuance
at that point can interrupt HTTPS. Preserve a failed route-probe latch and stop
the release client immediately; an already accepted server deployment can
continue and must be observed separately.

Helpful Links:

- [LARS (for local development)](https://github.com/bitcoin-sv/lars)
- [CARS CLI (for cloud deployment)](https://github.com/bitcoin-sv/cars-cli)
- [RUN YOUR OWN CARS NODE](https://github.com/bitcoin-sv/cars-node)
- [Specification for deployment-info.json](https://github.com/bitcoin-sv/BRCs/blob/master/apps/0102.md)

## Getting Started

- Clone this repository
- Run `npm i` to install dependencies
- Run `npm run lars` to configure the local environment according to your needs
- Use `npm run start` to spin up and start writing code
- When you're ready to publish your project, start by running `npm run cars` and configuring one (or, especially for overlays, ideally multiple) hosting provider(s)
- For each of your configurations, execute `npm run build` to create CARS project artifacts
- Deploy with `npm run deploy` and your project will be online
- Use `cars` interactively, or visit your hosting provider(s) web portals, to view logs, configure custom domains, and pay your hosting bills
- Share your new BSV project, it is now online!

## Directory Structure

The project structure is roughly as follows, although it can vary by project.

```
| - deployment-info.json
| - package.json
| - local-data/
| - frontend/
  | - package.json
  | - webpack.config.js
  | - src/...
  | - public/...
  | - build/...
| - backend/
  | - package.json
  | - tsconfig.json
  | - mod.ts
  | - src/
    | - contracts/...
    | - lookup-services/...
    | - topic-managers/...
    | - script-templates/...
  | - artifacts/
  | - dist/
```

The one constant is `deployment-info.json`.

## License

[Open BSV License](./LICENSE.txt)

Signed uploads normalize case-insensitive header names before delegating to the SDK public HTTPS transport, so the server-required content type replaces the file MIME hint without changing certificate, destination, or redirect checks. File management reads bounded pages and offers **Load More Files**, including an explicit provider-recovery notice for unsigned legacy records.
