{ pkgs }: {
  deps = [
    pkgs.python310
    pkgs.python310Packages.flask
    pkgs.python310Packages.flask-cors
    pkgs.python310Packages.matplotlib
    pkgs.python310Packages.numpy
    pkgs.python310Packages.pandas
    pkgs.python310Packages.pillow
    pkgs.python310Packages.pyjwt
    pkgs.python310Packages.bcrypt
  ];
}