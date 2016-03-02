# GUI tool for working on eschol-specific parts of our OJS database

###################################################################################################
# Use the right paths to everything, basing them on this script's directory.
def getRealPath(path) Pathname.new(path).realpath.to_s; end
$homeDir    = ENV['HOME'] or raise("No HOME in env")
$scriptDir  = getRealPath "#{__FILE__}/.."

###################################################################################################
# External code modules
require 'cgi'
require 'configparser'
require 'digest'
require 'json'
require 'sinatra'
require 'sinatra/reloader' if development?
require 'sequel'
require 'unindent'

###################################################################################################
# Use the Sequel gem to get connection pooling, thread safety, etc.
conf = ConfigParser.new("#{$homeDir}/.passwords/ojs_db_pw.mysql")['mysql']
DB = Sequel.connect(:adapter=>'mysql2', 
                    :host=>conf['host'], :database=>conf['database'], 
                    :user=>conf['user'], :password=>conf['password'])

class User < Sequel::Model
  set_primary_key :user_id
  one_to_many :escholRoles
end

# eSchol roles table
class EscholRole < Sequel::Model
  many_to_one :user
end

###################################################################################################
# Global defaults
DEFAULT_PAGE_SIZE = 10

###################################################################################################
# If a cache buster comes in, strip it off and re-dispatch the request
get %r{(.*)\._[0-9A-Z]{8}(\..*)} do
  call env.merge("PATH_INFO" => "#{params['captures'][0]}#{params['captures'][1]}")
end

###################################################################################################
# Transform a URL into a cache-busting URL that does the same thing.
$fileHashes = {}
def getFileHash(path)
  key = "#{path}:#{File.mtime(path)}"
  if !$fileHashes.include?(key)
    $fileHashes[key] = Digest::MD5.file(path).hexdigest.to_i(16).to_s(36)[0,8].upcase
  end
  return $fileHashes[key]
end

###################################################################################################
# Pick up all URLs in a string, and if they refer to a local file, change them to cache busters.
def cacheBustAll(htmlString)
  return htmlString.gsub(%r{(href|src)="([^"]+)"}) { |m|
    attrib, url = $1, $2
    path = "#{File.dirname(__FILE__)}/public#{url}"
    File.exist? path and url.sub!(/\.[^\.]+$/, "._#{getFileHash(path)}\\0")
    "#{attrib}=\"#{url}\""
  }
end

###################################################################################################
# The outer framework of every page is exactly the same.
def genAppPage(title, pageName, initialDataLink)
  # Most of the boilerplate below is directly from Bootstrap's recommended framework
  return cacheBustAll(%{
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>#{CGI.escapeHTML(title)}</title>
        <link rel="stylesheet" href="/lib/bootstrap/dist/css/bootstrap.css">
        <link rel="stylesheet" href="/css/global.css">
        <link rel="stylesheet" href="/css/#{pageName}.css">
        <script src="/lib/jquery/dist/jquery.min.js"></script>
        <script src="/lib/underscore/underscore.js"></script>
        <script src="/lib/react/react.js"></script>
      </head>
      <body>
        <div id="uiBase" />
        <script src="/js/global.js"></script>
        <script src="#{initialDataLink}"></script>
        <script src="/js/#{pageName}.js"></script>
        <script src="/lib/bootstrap/dist/js/bootstrap.js"></script>
      </body>
    </html>
  }).unindent
end

###################################################################################################
# Users list page
get "/listUsers" do
  genAppPage("Users [Subu]", "listUsers", "/api/listUsers?init=#{Time.now.to_i}")
end

get "/api/listUsers" do
  users = User.select(:user_id, :username, :first_name, :middle_name, :last_name, :email).order(:email)
  if (filter = params['filter']) && filter.length > 1
    users = users.grep([:last_name, :email], "%#{filter}%", :case_insensitive=>true)
  end
  pageSize = (params['pageSize'] || DEFAULT_PAGE_SIZE).to_i
  pageNum = (params['pageNum'] || 1).to_i
  result = {
    :total => users.count,
    :users => users.offset(pageSize*(pageNum-1)).limit(pageSize).map { |row| row.to_hash }
  }
  if params['init']
    content_type :js
    "subuInitialData = #{result.to_json}"
  else
    content_type :json
    result.to_json
  end
end

###################################################################################################
# User (single) page
get "/editUser/:user_id" do |user_id|
  user = User[user_id]
  genAppPage("#{user[:email]} [Subu]", "editUser", "/api/editUser/#{user_id}?init=#{Time.now.to_i}")
end

get "/api/editUser/:user_id" do |user_id|
  user = User[user_id]
  result = user.to_hash
  if params['init']
    content_type :js
    "subuInitialData = #{result.to_json}"
  else
    content_type :json
    result.to_json
  end
end
