// tests the fs methods chown and fchown
"use strict";
var assert = require("assert"),
    path = require("path"),
    fs = require("../fs-ext"),
    tmp_dir = "/tmp",
    file_path = path.join(tmp_dir, "fs-ext_chown.test"),
    uid = process.getuid(),
    other_uid = 65534,
    fd;

function check_stats(uid) {
  var stats = fs.statSync(file_path);
  assert.equal(stats.uid, uid);
  assert.equal(stats.gid, uid);
}

fd = fs.openSync(file_path, "w");
fs.closeSync(fd);
fs.chmodSync(file_path, "0666");

fs.chownSync(file_path, other_uid, other_uid);
check_stats(other_uid);

fd = fs.openSync(file_path, "w+");
fs.fchownSync(fd, uid, uid);
fs.closeSync(fd);
check_stats(uid);

fs.chown(file_path, other_uid, other_uid, function (error) {
  assert.ok(!error);
  check_stats(other_uid);

  fd = fs.openSync(file_path, "w+");
  fs.fchown(fd, uid, uid, function (error) {
    fs.closeSync(fd);
    assert.ok(!error);
    check_stats(uid);
  });
});

process.addListener("exit", function() {
  try {
    fs.closeSync(fd);
  } catch (error) {}
  try {
    fs.unlinkSync(file_path);
  } catch (error) {
    console.warn("  deleting", file_path, "failed");
  }
});