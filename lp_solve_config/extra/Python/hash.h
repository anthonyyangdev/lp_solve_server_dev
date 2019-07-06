#ifndef HEADER_hash
#define HEADER_hash

typedef struct _hashelem
{
  char             *name;
  int               index;
  struct _hashelem *next;
  struct _hashelem *nextelem;
} hashelem_t;

typedef struct _hashtable
{
  hashelem_t         **table;
  int              size;
  int              base;
  int              count;
  struct _hashelem *first;
  struct _hashelem *last;
} hashtable_t;

#ifdef __cplusplus
extern "C" {
#endif
  
  /** Create a new hash table.  
      @param size - the number of elements in the hash table
      @param base - doesn't seem to be used
  */
  hashtable_t *create_hash_table(int size, int base);
  
  /** Free hash table created with create_hash_table.
      @param ht - hash table to release.
  */
  void      free_hash_table(hashtable_t *ht);
  
  /** Lookup name in a hashtable  
      @param name - key to look up
      @param ht   - hash table to look name up in.
  */
  hashelem_t  *findhash(const char *name, hashtable_t *ht);

  /** Enter name into a hashtable  
      @param name - key to enter
      @param ht   - hash table to add name to.
  */
  hashelem_t  *puthash(const char *name, int index, hashelem_t **list, 
		     hashtable_t *ht);

  void      drophash(const char *name, hashelem_t **list, hashtable_t *ht);
  void      free_hash_item(hashelem_t **hp);

  hashtable_t *copy_hash_table(hashtable_t *ht, hashelem_t **list, int newsize);
  
#ifdef __cplusplus
}
#endif

#endif /* HEADER_lp_hash */
