import {Construct} from "constructs";
import {AssetType, TerraformAsset} from "cdktf";
import * as path from 'path';
import {Lambda} from "@modules/lambda";

export class LayerConstruct extends Construct {
    public readonly authServiceLayer: Lambda;
    public readonly databaseServiceLayer: Lambda;
    public readonly utilServiceLayer: Lambda;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const authServiceLayer = new Lambda(this, 'auth_service', {
            createLayer: true,

            layerName: 'saas-auth-service-layer',
            description: 'saas Authentication Layer',
            compatibleRuntimes: ['nodejs18.x'],

            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'auth_service_asset', {
                path: path.resolve(__dirname, 'auth-service/dist'),
                type: AssetType.ARCHIVE
            }).path,
            ignoreSourceCodeHash: true
        });

        const databaseServiceLayer = new Lambda(this, 'database_service', {
            createLayer: true,

            layerName: 'saas-database-service-layer',
            description: 'saas Database Layer',
            compatibleRuntimes: ['nodejs18.x'],

            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'database_service_asset', {
                path: path.resolve(__dirname, 'database-service/dist'),
                type: AssetType.ARCHIVE
            }).path,
            ignoreSourceCodeHash: true
        });

        const utilServiceLayer = new Lambda(this, 'util_service', {
            createLayer: true,

            layerName: 'saas-util-service-layer',
            description: 'saas Utilities Layer',
            compatibleRuntimes: ['nodejs18.x'],

            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'util_service_asset', {
                path: path.resolve(__dirname, 'util-service/dist'),
                type: AssetType.ARCHIVE
            }).path,
            ignoreSourceCodeHash: true
        });

        this.authServiceLayer = authServiceLayer;
        this.databaseServiceLayer = databaseServiceLayer;
        this.utilServiceLayer = utilServiceLayer;
    }
}