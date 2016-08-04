angular.module('RDash')
        .controller('Notif', ['$scope', '$window', '$rootScope', '$location', '$http', '$modal', Notif]);

angular.module('RDash')
        .controller('myModalNotif', ['$rootScope', '$scope', '$modalInstance', 'Items', '$http', '$modal', '$window', function ($rootScope, $scope, $modalInstance, Items, $http, $modal, $window)
            {
                $scope.items = Items;

                $scope.openModalHija = function ($size, $index, $url)
                {
                    var modalInstance = $modal.open({
                        templateUrl: $url,
                        controller: 'myModalNotif',
                        size: $size, resolve: {
                            Items: function () {
                                return $index;
                            }
                        }
                    });
                };

                $scope.elimElemento = function (param)
                {
                    $http.post("model/eliminarNotificacion.php", param)
                            .success(function (response) {
                                if (response === "OK") {
                                    $scope.openModalHija('sm', "Eliminada correctamente la notificación.", "ok.html");
                                    $rootScope.$broadcast('eliminadaNotif');
                                } else {
                                    $scope.openModalHija('sm', response, 'error.html');
                                }
                                ;
                            });
                    $modalInstance.dismiss('cancel');
                };
                $scope.cancel = function ()
                {
                    $modalInstance.dismiss('cancel');
                };
            }]);

function Notif($scope, $window, $rootScope, $location, $http, $modal) {
    $scope.nombreN = "";
    $scope.descripcionN = "";
    $scope.editar = false;
    $scope.notificaciones = [];
    $scope.notif = true;
    $scope.idP = "";
    $scope.dtInicio = new Date();
    $scope.idActualizar = "";
    $scope.logueado = false;
    $rootScope.hayNotif = false;
    $scope.verificarPrivilegio = function () {
        if (typeof ($window.sessionStorage.gNot) !== "undefined")
        {
            $scope.logueado = $window.sessionStorage.gNot;
        }
        if (!$scope.logueado)
            $location.path("/Sesion");
    };
    $scope.verificarPrivilegio();
    $scope.buscarNotificaciones = function () {
        $http.get("model/buscarNotif.php?id=" + $window.sessionStorage.nameUser)
                .then(function (response) {
                    $scope.notificaciones = response.data;
                });
    };
    $scope.buscarNotificaciones();
    $scope.notifEditar = function (index) {
        $scope.editar = true;
        //cargar datos a modificar
        for (var i = $scope.notificaciones.length - 1; i >= 0; i--) {
            if ($scope.notificaciones[i].id === index) {
                $scope.nombreN = $scope.notificaciones[i].nombre;
                $scope.descripcionN = $scope.notificaciones[i].descripcion;
                $scope.dtInicio = new Date($scope.notificaciones[i].fecha);
                $scope.dtInicio.setMinutes($scope.dtInicio.getMinutes() + $scope.dtInicio.getTimezoneOffset());
                $scope.editar = true;
                $scope.idActualizar = $scope.notificaciones[i].id;
                $scope.notificaciones.splice(i, 1);
                break;
            }
        }
        ;
    };
    $scope.guardar = function () {
        var data = {nombre: $scope.nombreN, desc: $scope.descripcionN,
            fecha: new Date($scope.dtInicio), usuario: $window.sessionStorage.nameUser, id: $scope.idActualizar};
        if ($scope.editar) {
            $http.post("model/actualizarNotificacion.php", data)
                    .success(function (data) {
                        if (data === "OK")
                        {
                            $scope.openModal('sm', "Actualizada correctamente la notificación.", 'ok.html');
                            $scope.nombreN = "";
                            $scope.descripcionN = "";
                            $scope.dtInicio = new Date();
                            $scope.formN.$pristine = true;
                            $scope.buscarNotificaciones();
                            $scope.editar = false;
                            $scope.idActualizar = "";
                        } else
                            $scope.openModal('sm', data, 'error.html');
                    }).error(function (data) {
                $scope.openModal('xs', data, 'error.html');
            });
        } else {
            $http.post("model/insertarNotificacion.php", data)
                    .success(function (data) {
                        if (data === "OK")
                        {
                            $scope.openModal('sm', "Insertada correctamente la notificación.", 'ok.html');
                            $scope.nombreN = "";
                            $scope.descripcionN = "";
                            $scope.dtInicio = new Date();
                            $scope.formN.$pristine = true;
                            $scope.buscarNotificaciones();
                        } else
                            $scope.openModal('sm', data, 'error.html');
                    }).error(function (data) {
                $scope.openModal('xs', data, 'error.html');
            });
        }
    };
    $scope.openModal = function ($size, $index, $url)
    {
        var modalInstance = $modal.open({
            templateUrl: $url,
            controller: 'myModalNotif',
            size: $size, resolve: {
                Items: function () {
                    return $index;
                }
            }
        });
    };
    $rootScope.$on('eliminadaNotif', function () {
        $scope.buscarNotificaciones();
    });
}