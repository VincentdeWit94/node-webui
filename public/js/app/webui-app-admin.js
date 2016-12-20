'use strict';

// var webuiApp = angular.module('webui-app', ['ngSanitize', 'ui.select']);
// var webuiApp = angular.module('webui-app', ['ngSanitize', 'ui.select', 'ngRoute', 'smart-table']);
// var webuiApp = angular.module('webui-app', ['ngSanitize', 'ui.select', 'ngRoute', 'bsTable']);
var webuiApp = angular.module('webui-app', ['ngSanitize', 'ui.select', 'ngRoute', 'bsTable', 'ui.bootstrap', 'base64', 'angular-ladda', 'chart.js']);


webuiApp.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

webuiApp.config(function (laddaProvider) {
    laddaProvider.setOption({ /* optional */
        style: 'expand-right',
        spinnerSize: 18,
        spinnerColor: '#ffffff'
    });
});

webuiApp.config(function ($routeProvider) {
    $routeProvider
        .when('/add', {
            templateUrl: '/js/app/streams/add/streams-add.html',
            controller: 'streamsAddCtrl',
            controllerAs: 'vm'
        })
        .when('/send', {
            templateUrl: '/js/app/streams/send/streams-send.html',
            controller: 'streamsSendCtrl',
            controllerAs: 'vm'
        })
        .when('/fblive', {
            templateUrl: '/js/app/streams/fblive/streams-fblive.html',
            controller: 'streamsFbLiveCtrl',
            controllerAs: 'vm'
        })

        .when('/youtube', {
            templateUrl: '/js/app/streams/youtube/streams-send-youtube.html',
            controller: 'streamsSendYoutubeCtrl',
            controllerAs: 'vm'
        })
        .when('/active/:streamTypeSelected?', { 
            templateUrl: '/js/app/streams/active/streams-active.html',
            controller: 'streamsActiveCtrl',
            controllerAs: 'vm'
        })
        .when('/config/:configTypeSelected?', {
            templateUrl: '/js/app/streams/config/streams-config.html',
            controller: 'streamsConfigCtrl',
            controllerAs: 'vm'
        })
        .when('/vod/', {
            templateUrl: '/js/app/streams/vod/streams-vod.html',
            controller: 'streamsVodCtrl',
            controllerAs: 'vm'
        })
        .otherwise('/active', {
            templateUrl: '/js/app/streams/active/streams-active.html',
            controller: 'streamsActiveCtrl',
            controllerAs: 'vm'
        });
});

webuiApp.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

// webuiApp.service('checkEmsConnection', function () {
//     console.log('webuiApp service checkEmsConnection ');
//
//     // this.connectionStatus = function (resultStatus) {
//     //     console.log('service checkEmsConnection connectionStatus');
//     //
//     //     $http.get("ems/api/check-connection").then(function (response) {
//     //         console.log(JSON.stringify(response));
//     //
//     //         var data = response.data;
//     //
//     //         if (data.code == "ECONNREFUSED") {
//     //             resultStatus(false) ;
//     //         }
//     //
//     //         if(data.status == "SUCCESS"){
//     //             resultStatus(true) ;
//     //         }else{
//     //             resultStatus(false) ;
//     //         }
//     //     });
//     // }
//
// });

webuiApp.factory('listPullStreamFactory', [ '$http', '$q', function ($http, $q) {
    console.log('webuiApp service listPullStreamFactory ');

    var factory = {};

    factory.updateListStreams = function () {
        console.log('factory updateListStreams');

        var deferred = $q.defer();

        var inboundStreamList = [];

        // return 12;

        $http.get("/ems/api/liststreams").then(function (response) {

            // console.log('response '+JSON.stringify(response));

            if (response.data.data != null) {
                var listStreamsDataTemp = response.data.data;

                for (var i in listStreamsDataTemp) {

                    if (listStreamsDataTemp[i].type.charAt(0) == 'I' && listStreamsDataTemp[i].type != 'IFR') {

                        var obj = {};

                        obj['name'] = listStreamsDataTemp[i].name;
                        obj['sourceUri'] = 'inbound';

                        if (listStreamsDataTemp[i].hasOwnProperty('pullSettings')) {
                            obj['sourceUri'] = listStreamsDataTemp[i].pullSettings.uri;
                        }

                        inboundStreamList.push(obj);
                    }
                }
            }

            console.log('inboundStreamList '+JSON.stringify(inboundStreamList));

            deferred.resolve(inboundStreamList);

        });

        return deferred.promise;
    };


    return factory;

}]);

webuiApp.controller('connectionButtonCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout ) {

    console.log('connectionButtonCtrl loaded ');

    $scope.connectionStatus = 'disconnected';
    $scope.connectionText = 'EMS Offline. Please Start EMS.';

    checkEmsConnection();
    function checkEmsConnection() {
        $http.get("/ems/api/check-connection").then(function (response) {
            // console.log(JSON.stringify(response));

            var data = response.data;

            if (data.code == "ECONNREFUSED") {
                $scope.connectionStatus = 'disconnected';
                $scope.connectionText = 'EMS Offline. Please Start EMS.';
                $scope.dashboardConnectionText = 'Not Connected. Please Start EMS.';
                $scope.statusConnected = 'status';
            }

            if(data.status == "SUCCESS"){
                $scope.connectionStatus = '';
                $scope.connectionText = 'EMS Online. Connected to EMS';
                $scope.dashboardConnectionText = 'Connected.';
                $scope.statusConnected = 'statusConnected';
            }else{
                $scope.connectionStatus = 'disconnected';
                $scope.connectionText = 'EMS Offline. Please Start EMS.';
                $scope.dashboardConnectionText = 'Not Connected. Please Start EMS.';
                $scope.statusConnected = 'status';
            }

            // $timeout(function () {
            //     // console.log("$timeout triggered");
            //     checkEmsConnection();
            // }, 10000);
        });
    }
}]);

