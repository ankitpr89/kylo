import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {UpgradeModule} from "@angular/upgrade/static";
import {PreviewDatasetCollectionService} from "../feed-mgr/catalog/api/services/preview-dataset-collection.service";

import {addButtonServiceProvider, broadcastServiceProvider, notificationServiceProvider} from "./angular2";
import {TemplateService} from "../repository/services/template.service";
//import {previewDatasetCollectionServiceProvider} from "./angular2";
@NgModule({
    imports: [
        CommonModule,
        UpgradeModule
    ],
    providers: [
        notificationServiceProvider,
        PreviewDatasetCollectionService,
        addButtonServiceProvider,
        broadcastServiceProvider,
        TemplateService
    ]
})
export class KyloServicesModule {

}
