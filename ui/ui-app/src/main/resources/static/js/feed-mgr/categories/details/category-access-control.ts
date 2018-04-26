import * as angular from 'angular';
import * as _ from "underscore";
import AccessControlService from '../../../services/AccessControlService';
const moduleName = require('feed-mgr/categories/module-name');

var directive = function () {
    return {
        restrict: "EA",
        bindToController: {
            stepIndex: '@'
        },
        scope: {},
        controllerAs: 'vm',
        templateUrl: 'js/feed-mgr/categories/details/category-access-control.html',
        controller: "CategoryAccessControlController",
        link: function ($scope:any, element:any, attrs:any, controller:any) {
        }
    };
};


export class CategoryAccessControlController  {


    model:any;
    categoryAccessControlForm:any;
    /**
     * Indicates if the properties may be edited.
     */
    allowEdit:boolean = false;
    
    /**
     * Category data used in "edit" mode.
     * @type {CategoryModel}
     */
    editModel:any;

    /**
     * Indicates if the view is in "edit" mode.
     * @type {boolean} {@code true} if in "edit" mode or {@code false} if in "normal" mode
     */
    isEditable:any;

    /**
     * Indicates of the category is new.
     * @type {boolean}
     */
    isNew:boolean;
    onSave:any;
    onEdit:any;

        


    constructor(private $scope:any, private $q:any, private $mdToast:any, private CategoriesService:any
        , private accessControlService:AccessControlService, private EntityAccessControlService:any, private $mdDialog:any) {

        /**
         * ref back to this controller
         * @type {TemplateAccessControlController}
         */
        var self = this;

        this.categoryAccessControlForm = {};

        this.model = CategoriesService.model;

        if (CategoriesService.model.roleMemberships == undefined) {
            CategoriesService.model.roleMemberships = this.model.roleMemberships = [];
        }

        if (CategoriesService.model.feedRoleMemberships == undefined) {
        	CategoriesService.model.feedRoleMemberships = this.model.feedRoleMemberships = [];
        }

        /**
         * Indicates if the properties may be edited.
         */
        self.allowEdit = false;

        /**
         * Category data used in "edit" mode.
         * @type {CategoryModel}
         */
        self.editModel = CategoriesService.newCategory();

        /**
         * Indicates if the view is in "edit" mode.
         * @type {boolean} {@code true} if in "edit" mode or {@code false} if in "normal" mode
         */
        self.isEditable = false;

        /**
         * Indicates of the category is new.
         * @type {boolean}
         */
        self.isNew = true;

        $scope.$watch(
            function () {
                return CategoriesService.model.id
            },
            function (newValue:any) {
                self.isNew = !angular.isString(newValue)
            }
        );

        /**
         * Category data used in "normal" mode.
         * @type {CategoryModel}
         */
        self.model = CategoriesService.model;

        /**
         * Switches to "edit" mode.
         */
        self.onEdit = function () {
            self.editModel = angular.copy(self.model);
        };

        /**
         * Saves the category .
         */
        self.onSave = function () {
            var model = angular.copy(CategoriesService.model);
            model.roleMemberships = self.editModel.roleMemberships;
            model.feedRoleMemberships = self.editModel.feedRoleMemberships;
            model.owner = self.editModel.owner;
            model.allowIndexing = self.editModel.allowIndexing;
            EntityAccessControlService.updateRoleMembershipsForSave(model.roleMemberships);
            EntityAccessControlService.updateRoleMembershipsForSave(model.feedRoleMemberships);

            //TODO Open a Dialog showing Category is Saving progress
            CategoriesService.save(model).then(function (response:any) {
                self.model = CategoriesService.model = response.data;
                //set the editable flag to false after the save is complete.
                //this will flip the directive to read only mode and call the entity-access#init() method to requery the accesss control for this entity
                self.isEditable = false;
                CategoriesService.update(response.data);
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Saved the Category')
                        .hideDelay(3000)
                );
            }, function (err:any) {
                //keep editable active if an error occurred
                self.isEditable = true;
                $mdDialog.show(
                    $mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title("Save Failed")
                        .textContent("The category '" + model.name + "' could not be saved. " + err.data.message)
                        .ariaLabel("Failed to save category")
                        .ok("Got it!")
                );
            });
        };

        //Apply the entity access permissions
        $q.when(accessControlService.hasPermission(AccessControlService.CATEGORIES_EDIT,self.model,AccessControlService.ENTITY_ACCESS.CATEGORY.CHANGE_CATEGORY_PERMISSIONS)).then(function(access:any) {
            self.allowEdit = access;
        });

    }

}

angular.module(moduleName).controller("CategoryAccessControlController",
    ["$scope", "$q", "$mdToast", "CategoriesService", "AccessControlService", "EntityAccessControlService" , "$mdDialog", CategoryAccessControlController]);

angular.module(moduleName).directive("thinkbigCategoryAccessControl", directive);
